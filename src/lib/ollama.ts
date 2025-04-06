import { AgentAction, AgentRecommendation, AgentRouting, AgentSummary, AgentTimeEstimation, Ticket } from "@/types/agent-types";

// Configuration for Ollama
interface OllamaConfig {
  baseUrl: string;
  model: string;
}

// Default configuration
const defaultConfig: OllamaConfig = {
  baseUrl: "http://localhost:11434",
  model: "llama3"
};

// Ollama API client
export class OllamaClient {
  private config: OllamaConfig;

  constructor(config: Partial<OllamaConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Method to update configuration
  setConfig(baseUrl: string, model: string): void {
    this.config.baseUrl = baseUrl;
    this.config.model = model;
    console.log(`Ollama configuration updated: baseUrl=${baseUrl}, model=${model}`);
  }

  // Generic method to send prompts to Ollama
  private async sendPrompt(prompt: string, systemPrompt: string = ""): Promise<string> {
    try {
      console.log(`Sending prompt to Ollama (${this.config.model}):`, prompt.substring(0, 100) + "...");
      
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: prompt,
          system: systemPrompt,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error calling Ollama:", error);
      // Provide more detailed error message
      let errorMessage = error instanceof Error ? error.message : String(error);
      
      // Handle common error scenarios
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        errorMessage = `Connection to Ollama failed. Make sure Ollama is running at ${this.config.baseUrl}`;
      }
      
      return `Error: ${errorMessage}`;
    }
  }

  // Specialized agents using the same base model with different system prompts
  
  // Summarizer Agent
  async generateSummary(ticket: Ticket): Promise<AgentSummary> {
    const systemPrompt = `You are an expert customer support summarizer. 
    Analyze the ticket and provide a concise summary, key points, and the sentiment of the customer.
    Format your response as JSON like this: { "summary": "...", "keyPoints": ["point1", "point2"], "sentiment": "positive|neutral|negative" }`;
    
    const prompt = `Ticket #${ticket.id}
    Subject: ${ticket.subject}
    Description: ${ticket.description}
    From: ${ticket.customerName} (${ticket.customerEmail})`;
    
    const response = await this.sendPrompt(prompt, systemPrompt);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Error parsing summary JSON:", error);
      return {
        summary: "Error generating summary",
        keyPoints: ["Error processing the ticket"],
        sentiment: "neutral"
      };
    }
  }

  // Action Extractor Agent
  async extractActions(ticket: Ticket): Promise<AgentAction> {
    const systemPrompt = `You are an expert at identifying necessary actions from customer support tickets.
    Analyze the ticket and extract a list of actions that should be taken, including type, description and priority (low, medium, high).
    Format your response as JSON like this: { "actions": [{"type": "escalation|follow-up|information|resolution", "description": "...", "priority": "low|medium|high"}] }`;
    
    const prompt = `Ticket #${ticket.id}
    Subject: ${ticket.subject}
    Description: ${ticket.description}
    From: ${ticket.customerName} (${ticket.customerEmail})`;
    
    let response;
    try {
      response = await this.sendPrompt(prompt, systemPrompt);
      
      // Attempt to parse JSON, if it fails, try to extract JSON from the response
      // This helps with models that sometimes include markdown formatting
      return JSON.parse(response);
    } catch (error) {
      console.error("Error parsing actions JSON:", error, "Raw response:", response);
      
      // Try to extract JSON if the response contains a JSON object
      try {
        if (response && response.includes("{") && response.includes("}")) {
          const jsonStart = response.indexOf("{");
          const jsonEnd = response.lastIndexOf("}") + 1;
          const jsonString = response.substring(jsonStart, jsonEnd);
          return JSON.parse(jsonString);
        }
      } catch (extractError) {
        console.error("Failed to extract JSON from response:", extractError);
      }
      
      return {
        actions: [{
          type: "information",
          description: "Error extracting actions from ticket",
          priority: "medium"
        }]
      };
    }
  }

  // Routing Agent
  async suggestRouting(ticket: Ticket): Promise<AgentRouting> {
    const systemPrompt = `You are an expert at routing customer support tickets to the correct team.
    Analyze the ticket and suggest the most appropriate team, along with confidence score and reasoning.
    Format your response as JSON like this: { "recommendedTeam": "technical-support|billing|product|sales|general", "confidence": 0.85, "alternativeTeams": [{"team": "...", "confidence": 0.4}], "reasoning": "..." }`;
    
    const prompt = `Ticket #${ticket.id}
    Subject: ${ticket.subject}
    Description: ${ticket.description}
    From: ${ticket.customerName} (${ticket.customerEmail})`;
    
    const response = await this.sendPrompt(prompt, systemPrompt);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Error parsing routing JSON:", error);
      return {
        recommendedTeam: "general",
        confidence: 0.5,
        alternativeTeams: [],
        reasoning: "Error determining the appropriate team for this ticket"
      };
    }
  }

  // Resolution Recommendation Agent
  async recommendResolutions(ticket: Ticket, historicalData: string = ""): Promise<AgentRecommendation> {
    const systemPrompt = `You are an expert at recommending solutions for customer support tickets based on historical data.
    Analyze the ticket and provide suggested resolutions with confidence scores.
    Format your response as JSON like this: { "suggestedResolutions": [{"title": "...", "steps": ["step1", "step2"], "confidence": 0.75, "source": "..."}] }`;
    
    const prompt = `Ticket #${ticket.id}
    Subject: ${ticket.subject}
    Description: ${ticket.description}
    From: ${ticket.customerName} (${ticket.customerEmail})
    
    Historical similar cases:
    ${historicalData || "No historical data available."}`;
    
    const response = await this.sendPrompt(prompt, systemPrompt);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Error parsing recommendations JSON:", error);
      return {
        suggestedResolutions: [{
          title: "Error generating recommendations",
          steps: ["Please review the ticket manually"],
          confidence: 0.1
        }]
      };
    }
  }

  // Time Estimation Agent
  async estimateResolutionTime(ticket: Ticket, historicalData: string = ""): Promise<AgentTimeEstimation> {
    const systemPrompt = `You are an expert at estimating resolution times for customer support tickets.
    Analyze the ticket and provide an estimated resolution time in minutes, along with confidence and factors.
    Format your response as JSON like this: { "estimatedMinutes": 45, "confidence": 0.7, "factors": [{"name": "complexity", "impact": 0.5}] }`;
    
    const prompt = `Ticket #${ticket.id}
    Subject: ${ticket.subject}
    Description: ${ticket.description}
    From: ${ticket.customerName} (${ticket.customerEmail})
    
    Historical resolution times for similar cases:
    ${historicalData || "No historical data available."}`;
    
    const response = await this.sendPrompt(prompt, systemPrompt);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Error parsing time estimation JSON:", error);
      return {
        estimatedMinutes: 60,
        confidence: 0.3,
        factors: [{
          name: "error in estimation",
          impact: 1.0
        }]
      };
    }
  }
}

// Create a singleton instance
export const ollamaClient = new OllamaClient();
