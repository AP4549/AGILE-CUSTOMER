from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json
from datetime import datetime
from data_loader import DataLoader

app = Flask(__name__)
# Enable CORS with more specific settings
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration
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
        
        # Agent: Summarizer
        summary_prompt = f"""
Analyze this support ticket and provide:
1. A concise summary (3-4 sentences)
2. 3-5 key points
3. Customer sentiment (positive, neutral, or negative)

Ticket: {ticket['subject']}
Description: {ticket['description']}

Format your response as valid JSON with the following structure:
{{
  "summary": "The concise summary here",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "sentiment": "neutral"
}}
"""
        
        summary_result = call_ollama_agent(
            prompt=summary_prompt,
            system="You are a customer support AI that accurately summarizes tickets. Always respond with valid JSON.",
            model=model
        )
        results["summary"] = summary_result
        
        # Agent: Action Extractor
        actions_prompt = f"""
Analyze this support ticket and extract required actions:
Ticket: {ticket['subject']}
Description: {ticket['description']}

Identify 2-4 specific actions that should be taken to resolve this ticket.
Each action should have:
1. A type (investigation, customer contact, technical fix, escalation, etc.)
2. A priority (low, medium, high)
3. A clear description of what needs to be done

Format your response as valid JSON with the following structure:
{{
  "actions": [
    {{
      "type": "investigation",
      "priority": "high",
      "description": "Details of what needs to be investigated"
    }},
    {{
      "type": "technical fix",
      "priority": "medium",
      "description": "Details of what needs to be fixed"
    }}
  ]
}}
"""
        
        actions_result = call_ollama_agent(
            prompt=actions_prompt,
            system="You are a customer support expert who identifies required actions. Always respond with valid JSON.",
            model=model
        )
        results["actions"] = actions_result
        
        # Agent: Team Router
        routing_prompt = f"""
Analyze this support ticket and determine which team it should be routed to:
Ticket: {ticket['subject']}
Description: {ticket['description']}

Choose the most appropriate team and explain your reasoning.
Potential teams: technical-support, billing, account-management, product-feedback, security, legal

Format your response as valid JSON with the following structure:
{{
  "recommendedTeam": "technical-support",
  "confidence": 0.85,
  "reasoning": "Explanation of why this team is appropriate",
  "alternativeTeams": [
    {{"team": "account-management", "confidence": 0.25}}
  ]
}}
"""
        
        routing_result = call_ollama_agent(
            prompt=routing_prompt,
            system="You are a ticket routing specialist. Always respond with valid JSON.",
            model=model
        )
        results["routing"] = routing_result
        
        # NEW Agent: Sentiment Analyzer
        sentiment_prompt = f"""
Perform a detailed sentiment analysis of this customer support ticket:
Ticket: {ticket['subject']}
Description: {ticket['description']}

Analyze the customer's emotions, tone, and attitude in the message.
Be specific about the different emotions detected and their intensity.

Format your response as valid JSON with the following structure:
{{
  "overallSentiment": "positive/negative/neutral",
  "sentimentScore": 0.75,
  "primaryEmotions": ["frustration", "confusion"],
  "emotionalTriggers": ["product failure", "unclear instructions"],
  "customerTone": "professional but urgent",
  "urgencyLevel": "high/medium/low",
  "satisfactionIndicators": {{"positive": ["appreciate your help"], "negative": ["third time contacting support"]}}
}}
"""
        
        sentiment_result = call_ollama_agent(
            prompt=sentiment_prompt,
            system="You are a sentiment analysis specialist who can detect emotions and tone in text. Always respond with valid JSON.",
            model=model
        )
        results["sentiment"] = sentiment_result
        
        # Agent: Resolution Recommender
        recommendations_prompt = f"""
Based on this support ticket and historical data, recommend potential resolutions:
Ticket: {ticket['subject']}
Description: {ticket['description']}

Historical Context:
{historical_context}

Provide 1-3 suggested resolutions with clear steps.

Format your response as valid JSON with the following structure:
{{
  "suggestedResolutions": [
    {{
      "title": "Title of the resolution approach",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "confidence": 0.85,
      "source": "Based on historical case #TECH_021"
    }}
  ]
}}
"""
        
        recommendations_result = call_ollama_agent(
            prompt=recommendations_prompt,
            system="You are a support resolution specialist with access to historical cases. Always respond with valid JSON.",
            model=model
        )
        results["recommendations"] = recommendations_result
        
        # Agent: Time Estimator
        time_prompt = f"""
Estimate how long it will take to resolve this support ticket:
Ticket: {ticket['subject']}
Description: {ticket['description']}

Historical Context:
{historical_context}

Estimate the resolution time in minutes and explain the factors that influenced your estimate.

Format your response as valid JSON with the following structure:
{{
  "estimatedMinutes": 45,
  "confidence": 0.7,
  "factors": [
    {{"name": "Technical complexity", "impact": 0.3}},
    {{"name": "Clear reproduction steps", "impact": -0.1}},
    {{"name": "Historical data from similar cases", "impact": 0.1}}
  ]
}}
"""
        
        time_result = call_ollama_agent(
            prompt=time_prompt,
            system="You are a support resolution time estimator. Always respond with valid JSON.",
            model=model
        )
        results["timeEstimation"] = time_result
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def call_ollama_agent(prompt, system="", model=DEFAULT_MODEL):
    """Call Ollama API with the given prompt and system message"""
    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "system": system,
                "stream": False
            }
        )
        
        if response.status_code == 200:
            result = response.json().get("response", "")
            # Attempt to parse as JSON if it looks like JSON
            if result.strip().startswith("{") and result.strip().endswith("}"):
                try:
                    return json.loads(result)
                except:
                    pass
            return {"text": result}
        else:
            return {"error": f"Ollama API returned status code {response.status_code}"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == '__main__':
    print("Starting AI Customer Support System Backend...")
    app.run(debug=True, host='0.0.0.0', port=5000)
