# AI Customer Support System

A customer support ticket management system with AI-powered analysis using local LLMs via Ollama.

## Project Structure

```
Backend (Flask API)
├── API Endpoints
│   ├── /status - Server and Ollama connection status
│   ├── /historical-data - Access to past tickets
│   ├── /conversations - Retrieves conversation examples
│   ├── /tickets - Lists all support tickets
│   └── /process-ticket - Main endpoint for AI analysis
│
├── Multi-Agent System
│   ├── Summarizer Agent - Creates concise summaries with key points
│   ├── Action Extractor - Identifies required steps with priorities
│   ├── Team Router - Determines optimal department routing
│   ├── Sentiment Analyzer - Performs emotional content analysis
│   ├── Resolution Recommender - Suggests solutions from historical data
│   └── Time Estimator - Predicts resolution time with factors
│
├── Support Components
│   ├── DataLoader - Retrieves historical ticket data
│   └── call_ollama_agent() - Communicates with LLM API

Frontend (React)
├── Components
│   ├── Dashboard - Main UI container
│   ├── TicketList - Displays and filters tickets
│   ├── TicketDetail - Shows selected ticket information
│   ├── AgentResults - Displays AI analysis output
│   └── OllamaConfig - Connection settings interface
│
├── State Management
│   └── AgentContext - Manages ticket selection and AI processing
│
└── API Integration
    └── OllamaClient - Handles direct or backend AI communication
```

## Setup Instructions

### Backend Setup

1. Install dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

2. Start the Flask API server:
```bash
python app.py
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the dev server:
```bash
npm run dev
```

3. Configure the frontend to connect to the backend API instead of directly to Ollama:
   - Open the `frontend/src/config.js` file.
   - Set the `API_BASE_URL` to the backend server's URL (e.g., `http://localhost:5000`).

### Ollama Setup

1. Install Ollama from https://ollama.ai
2. Pull a model:
```bash
ollama pull llama3  # or mistral, codellama, etc.
```
3. Ensure Ollama is running when using the system.

## System Flow

1. User opens the React frontend → views and selects tickets.
2. Backend processes tickets through specialized AI agents.
3. Agents use Ollama LLM to analyze different aspects of the ticket.
4. Results are stored in the database and displayed in the UI.
