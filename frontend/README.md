🚀 Pipeline Builder (React + FastAPI)

A visual pipeline builder that allows users to create, connect, and execute workflows using a node-based interface.
Built with a custom execution engine that supports conditional logic, filtering, and proper null handling.

✨ Features
🧩 Drag-and-drop node-based pipeline UI (React Flow)
🔗 Connect nodes to define execution flow
⚙️ Backend execution engine (DAG-based processing)
🔍 Filter and condition nodes
🧠 Proper null propagation (real pipeline behavior)
📤 Output visualization per node
🔄 Dynamic data flow between nodes
🏗️ Tech Stack

Frontend

React (Create React App)
Zustand (state management)
React Flow (pipeline UI)

Backend

FastAPI (Python)
Async execution engine
Custom DAG traversal logic

 Demo Example:

Pipeline creation UI
Connected nodes
Output results
⚙️ How It Works
Users create nodes (Input, Filter, Condition, Output, etc.)
Nodes are connected to form a pipeline (graph)
Backend parses the graph and executes it in order
Data flows between nodes
Results are displayed in output nodes
🧠 Key Concepts
Directed Acyclic Graph (DAG) execution
Topological sorting for node processing
Null-safe data propagation
Modular node logic system
📦 Project Structure
VECTOR_PROJECT/
├── backend/
│   ├── main.py
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   └── .env
└── README.md
⚙️ Setup Instructions
1. Clone the repo
git clone <your-repo-url>
cd VECTOR_PROJECT
2. Backend Setup (FastAPI)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

Backend runs at:

http://localhost:8000
3. Frontend Setup (React)
cd frontend
npm install

Create .env file:

REACT_APP_API_URL=http://localhost:8000

Run frontend:

npm start

Frontend runs at:

http://localhost:3000
🔌 API Endpoints
POST /pipelines/parse → Validate pipeline structure
POST /pipelines/execute → Execute pipeline
🚧 Future Improvements
Save & load pipelines
User authentication
Deployment (Docker / Cloud)
More node types (LLM, API calls, transforms)
UI/UX enhancements
💡 Use Cases
Workflow automation tools
Data processing pipelines
AI pipeline orchestration
Visual programming systems
🧑‍💻 Author

Yogesh K

⭐ If you like this project

Give it a star ⭐ and share feedback!