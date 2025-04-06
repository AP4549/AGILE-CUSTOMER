# AI Customer Support System

A customer support ticket management system with AI-powered analysis using local LLMs via Ollama.

## Project Structure

```
AI-CustomerSupport-System/
│
├── frontend/                            # 💻 React + Vite frontend
│   └── ... (current React application)
│
├── backend/                             # 🧠 Python backend with multi-agent system
│   ├── agents/                          # Core agent functionality
│   ├── db/                              # SQLite database
│   ├── data/                            # Historical data
│   └── ollama_llm/                      # LLM interaction
│
└── README.md                            # Project documentation
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
