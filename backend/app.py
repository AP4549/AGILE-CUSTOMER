from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json
from datetime import datetime
import google.generativeai as genai
from data_loader import DataLoader

app = Flask(__name__)
# Enable CORS with more specific settings
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration for Ollama
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "llama3")

# Initialize data loader
data_loader = DataLoader()

@app.route('/', methods=['GET'])
def index():
    """Root endpoint for basic connectivity check"""
    return jsonify({
        "status": "ok",
        "message": "AI Customer Support System Backend API is running",
        "endpoints": ["/status", "/historical-data", "/conversations", "/process-ticket", "/tickets"]
    })

@app.route('/status', methods=['GET'])
def status():
    """Check if the backend server is running and can connect to Ollama"""
    try:
        # Check if Ollama is accessible
        response = requests.get(f"{OLLAMA_URL}/api/tags")
        
        if response.status_code == 200:
            models = response.json().get('models', [])
            return jsonify({
                "status": "ok",
                "ollama_connected": True,
                "models": models,
                "historical_tickets": len(data_loader.historical_tickets),
                "conversations": len(data_loader.conversations)
            })
        else:
            return jsonify({
                "status": "warning",
                "ollama_connected": False,
                "message": f"Ollama API returned status code {response.status_code}"
            })
    except Exception as e:
        return jsonify({
            "status": "error",
            "ollama_connected": False,
            "message": str(e)
        }), 500

@app.route('/historical-data', methods=['GET'])
def get_historical_data():
    """Return all historical ticket data"""
    return jsonify(data_loader.historical_tickets)

@app.route('/conversations', methods=['GET'])
def get_conversations():
    """Return all conversation examples"""
    return jsonify(data_loader.conversations)

@app.route('/tickets', methods=['GET'])
def get_tickets():
    """Return all tickets (historical tickets as support tickets)"""
    tickets = [
        {
            "id": ticket.get("Ticket ID", "Unknown"),
            "subject": ticket.get("Issue Category", "No Subject"),
            "description": ticket.get("Solution", "No Description"),
            "customerName": "Historical Data",
            "customerEmail": "historical@example.com",
            "createdAt": ticket.get("Date of Resolution", "Unknown Date"),
            "status": "resolved" if ticket.get("Resolution Status", "").lower() == "resolved" else "new",
        }
        for ticket in data_loader.historical_tickets
    ]

    # Add more unresolved tickets
    tickets.extend([
        {
            "id": "T006",
            "subject": "Payment gateway error",
            "description": "Unable to process payment for the subscription.",
            "customerName": "Alice Brown",
            "customerEmail": "alice.brown@example.com",
            "createdAt": datetime.now().isoformat(),
            "status": "new",
        },
        {
            "id": "T007",
            "subject": "Feature request: Multi-language support",
            "description": "Requesting support for multiple languages in the app.",
            "customerName": "Carlos Garcia",
            "customerEmail": "carlos.garcia@example.com",
            "createdAt": datetime.now().isoformat(),
            "status": "new",
        },
        {
            "id": "T008",
            "subject": "App crashes on startup",
            "description": "The app crashes immediately after launching on Android devices.",
            "customerName": "Diana Evans",
            "customerEmail": "diana.evans@example.com",
            "createdAt": datetime.now().isoformat(),
            "status": "new",
        },
    ])
    return jsonify(tickets)

@app.route('/process-ticket', methods=['POST'])
def process_ticket():
    """Process a ticket using multiple specialized agents"""
    try:
        data = request.json
        ticket = data.get('ticket')
        model = data.get('model', DEFAULT_MODEL)
        
        if not ticket:
            return jsonify({"error": "No ticket data provided"}), 400
        
        # Get historical data for context
        historical_context = data_loader.get_combined_data_for_ticket(ticket)
        
        # Process the ticket with multiple agents
        results = {}
        
        agent_functions = {
            "ollama": call_ollama_agent,
            "gemini": call_gemini_agent
        }
        
        selected_agent = agent_functions.get(model, call_ollama_agent)  # Default to Ollama

        # --- Agent Prompts ---
        # To improve readability, prompts are defined as variables
        
        def create_agent_prompt(role, instructions, ticket_info, extra_info=""):
            return f"""{instructions}

Ticket: {ticket_info['subject']}
Description: {ticket_info['description']}
{extra_info}

Format your response as valid JSON."""

        # Summarizer
        results["summary"] = selected_agent(create_agent_prompt(
            "Summarizer",
            """You are a customer support AI that accurately summarizes tickets. Analyze this support ticket and provide:
1. A concise summary (3-4 sentences)
2. 3-5 key points
3. Customer sentiment (positive, neutral, or negative)""",
            ticket,
            ""
        ))

        # Action Extractor
        results["actions"] = selected_agent(create_agent_prompt(
            "Action Extractor",
            """You are a customer support expert who identifies required actions. Analyze this support ticket and extract required actions:
Identify 2-4 specific actions that should be taken to resolve this ticket.
Each action should have:
1. A type (investigation, customer contact, technical fix, escalation, etc.)
2. A priority (low, medium, high)
3. A clear description of what needs to be done""",
            ticket,
            ""
        ))

        # Team Router
        results["routing"] = selected_agent(create_agent_prompt(
            "Team Router",
            """You are a ticket routing specialist. Analyze this support ticket and determine which team it should be routed to:
Choose the most appropriate team and explain your reasoning.
Potential teams: technical-support, billing, account-management, product-feedback, security, legal""",
            ticket,
            ""
        ))

        # Sentiment Analyzer
        results["sentiment"] = selected_agent(create_agent_prompt(
            "Sentiment Analyzer",
            """You are a sentiment analysis specialist who can detect emotions and tone in text. Perform a detailed sentiment analysis of this customer support ticket:
Analyze the customer's emotions, tone, and attitude in the message.
Be specific about the different emotions detected and their intensity.""",
            ticket,
            ""
        ))

        # Resolution Recommender
        results["recommendations"] = selected_agent(create_agent_prompt(
            "Resolution Recommender",
            """You are a support resolution specialist with access to historical cases. Based on this support ticket and historical data, recommend potential resolutions:
Provide 1-3 suggested resolutions with clear steps.""",
            ticket,
            f"Historical Context:\n{historical_context}"
        ))

        # Time Estimator
        results["timeEstimation"] = selected_agent(create_agent_prompt(
            "Time Estimator",
            """You are a support resolution time estimator. Estimate how long it will take to resolve this support ticket:
Estimate the resolution time in minutes and explain the factors that influenced your estimate.""",
            ticket,
            f"Historical Context:\n{historical_context}"
        ))

        return jsonify(results)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def call_ollama_agent(prompt, model=DEFAULT_MODEL):
    """Call Ollama API with the given prompt (which includes system prompt)"""
    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False}  # Use combined prompt
        )
        if response.status_code == 200:
            result = response.json().get("response", "")
            try:
                return json.loads(result)  # Attempt to parse JSON
            except json.JSONDecodeError:
                return {"text": result}  # Return as text if parsing fails
        else:
            return {"error": f"Ollama API returned status code {response.status_code}"}
    except Exception as e:
        return {"error": str(e)}

def call_gemini_agent(prompt):
    """Call Gemini API with the given prompt"""
    if not GEMINI_API_KEY:
        return {"error": "Gemini API key not configured."}

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')  # or 'gemini-pro-vision' if you need image support
        response = model.generate_content(prompt)
        if response and response.text:
            try:
                return json.loads(response.text)  # Attempt to parse JSON
            except json.JSONDecodeError:
                return {"text": response.text}  # Return as text if parsing fails
        else:
            return {"error": "Gemini API returned an empty or invalid response."}
    except Exception as e:
        return {"error": f"Error communicating with Gemini API: {e}"}

