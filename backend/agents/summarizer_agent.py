
"""
Summarizer Agent
---------------
This agent analyzes support tickets and provides a concise summary, key points, and sentiment.
"""

import json
import requests

class SummarizerAgent:
    def __init__(self, ollama_url, model):
        self.ollama_url = ollama_url
        self.model = model
        self.system_prompt = """
        You are an expert customer support summarizer. 
        Analyze the ticket and provide a concise summary, key points, and the sentiment of the customer.
        Format your response as JSON like this: 
        { "summary": "...", "keyPoints": ["point1", "point2"], "sentiment": "positive|neutral|negative" }
        """
    
    def process_ticket(self, ticket):
        """Process a ticket and return a summary"""
        prompt = f"""
        Ticket #{ticket['id']}
        Subject: {ticket['subject']}
        Description: {ticket['description']}
        From: {ticket['customerName']} ({ticket['customerEmail']})
        """
        
        response = self._call_ollama(prompt)
        
        try:
            # Try to parse the response as JSON
            if isinstance(response, str):
                result = json.loads(response)
            else:
                result = response
                
            # Ensure the response has the expected format
            if not all(k in result for k in ["summary", "keyPoints", "sentiment"]):
                raise ValueError("Response missing required fields")
                
            return result
        except Exception as e:
            # Fallback for parsing errors
            return {
                "summary": "Error generating summary",
                "keyPoints": ["Error processing the ticket"],
                "sentiment": "neutral",
                "error": str(e)
            }
    
    def _call_ollama(self, prompt):
        """Call Ollama API with the given prompt"""
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "system": self.system_prompt,
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
                return result
            else:
                return {
                    "summary": "API Error",
                    "keyPoints": [f"Ollama API returned status code {response.status_code}"],
                    "sentiment": "neutral"
                }
        except Exception as e:
            return {
                "summary": "Error calling Ollama",
                "keyPoints": [str(e)],
                "sentiment": "neutral"
            }
