# 🚀 Pipeline Builder (React + FastAPI)

A visual workflow builder that enables users to design, connect, and execute pipelines using an interactive node-based interface.  
The system is powered by a custom backend execution engine that processes workflows as a Directed Acyclic Graph (DAG), ensuring correct data flow, conditional logic handling, and null-safe execution.

---

## ✨ Features

- 🧩 Interactive drag-and-drop pipeline builder (React Flow)  
- 🔗 Node-based workflow creation with dynamic connections  
- ⚙️ Backend execution engine using DAG processing  
- 🔍 Built-in nodes: Filter, Condition, Transform, Delay, Merge  
- 🧠 Robust null propagation across the pipeline  
- 📤 Real-time output visualization per node  
- 🔄 Dynamic data flow between connected nodes  

---

## 🏗️ Tech Stack

### Frontend
- React (Create React App)  
- Zustand (lightweight state management)  
- React Flow (visual pipeline editor)  

### Backend
- FastAPI (high-performance Python framework)  
- Async execution engine  
- Custom graph traversal (topological sorting)  


## ⚙️ How It Works

1. Users create nodes (Input, Filter, Condition, Output, etc.)  
2. Nodes are connected to form a workflow graph  
3. The backend parses the graph into a DAG  
4. Nodes are executed in topological order  
5. Data flows between nodes based on connections  
6. Final outputs are rendered in output nodes  

---

## 🧠 Key Concepts

- Directed Acyclic Graph (DAG) execution model  
- Topological sorting for correct node order  
- Null-safe data propagation  
- Modular and extensible node architecture  

---

## 📦 Project Structure

```bash
VECTOR_PROJECT/
├── backend/
│   ├── main.py
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Yogesh-kk49/Pipeline-Builder.git
cd Pipeline-Builder
```

---

### 2. Backend Setup (FastAPI)

```bash
cd backend
pip install fastapi uvicorn
uvicorn main:app --reload
```

Backend runs at:  
👉 http://localhost:8000

---

### 3. Frontend Setup (React)

```bash
cd frontend
npm install
```

Create `.env` file inside `frontend/`:

```env
REACT_APP_API_URL=http://localhost:8000
```

Run the application:

```bash
npm start
```

Frontend runs at:  
👉 http://localhost:3000

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|---------|------------|
| POST   | `/pipelines/parse`   | Validate pipeline structure |
| POST   | `/pipelines/execute` | Execute pipeline |

---

## 🚧 Future Improvements

- 💾 Save and load pipelines  
- 🔐 User authentication & authorization  
- ☁️ Cloud deployment (Docker / AWS / Vercel)  
- 🤖 Integration with external APIs / LLMs  
- 🎨 Enhanced UI/UX and node customization  

---

## 💡 Use Cases

- Workflow automation systems  
- Data processing pipelines  
- AI/ML pipeline orchestration  
- Visual programming interfaces  

---

## 🧑‍💻 Author

**Yogesh K**

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ and sharing your feedback.