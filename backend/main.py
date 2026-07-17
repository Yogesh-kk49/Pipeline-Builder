from fastapi import FastAPI
from typing import List, Optional, final
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict
from collections import deque
import time
import asyncio
app = FastAPI()
import uuid
import os
from datetime import datetime
import sqlite3
import json

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pipelines.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    conn.execute(
        "CREATE TABLE IF NOT EXISTS pipelines ("
        "id TEXT PRIMARY KEY, "
        "name TEXT NOT NULL, "
        "nodes TEXT NOT NULL, "
        "edges TEXT NOT NULL, "
        "input_values TEXT NOT NULL, "
        "savedAt TEXT NOT NULL"
        ")"
    )
    conn.commit()
    conn.close()


init_db()
print("Local SQLite database ready at", DB_PATH)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Keep-alive ping bot (for Render free tier)
# =========================
# Render's free web services spin down after ~15 min of no inbound HTTP
# traffic. This background thread pings the app's own public URL every
# few minutes so Render always sees recent traffic and keeps it awake.
#
# Render automatically sets RENDER_EXTERNAL_URL to your service's public
# URL — no config needed there. If you want to point it somewhere else
# (e.g. local testing, or a different host), set PING_URL manually.

import threading
import requests

PING_URL = os.getenv("PING_URL") or os.getenv("RENDER_EXTERNAL_URL")
PING_INTERVAL_SECONDS = int(os.getenv("PING_INTERVAL_SECONDS", "600"))  # 10 min


def _keep_alive_loop():
    if not PING_URL:
        print("⚠️  Keep-alive ping bot disabled — no PING_URL / RENDER_EXTERNAL_URL set")
        return

    print(f"🤖 Keep-alive ping bot started — pinging {PING_URL} every {PING_INTERVAL_SECONDS}s")

    while True:
        time.sleep(PING_INTERVAL_SECONDS)
        try:
            resp = requests.get(PING_URL, timeout=10)
            print(f"🏓 Keep-alive ping -> {resp.status_code}")
        except Exception as e:
            print(f"⚠️  Keep-alive ping failed: {e}")


@app.on_event("startup")
def start_keep_alive_bot():
    thread = threading.Thread(target=_keep_alive_loop, daemon=True)
    thread.start()

# =========================
# Models
# =========================

class Node(BaseModel):
    id: str
    type: str
    data: Optional[dict] = {}
    position: Optional[dict] = {}


class Edge(BaseModel):
    source: str
    target: str
    sourceHandle: str = None
    targetHandle: str = None


class Pipeline(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


class ExecuteRequest(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    input_values: dict

class SavePipelineRequest(BaseModel):
    name: str
    nodes: List[Node]
    edges: List[Edge]
    input_values: dict

@app.delete("/pipelines/{pipeline_id}")
def delete_pipeline(pipeline_id: str):
    try:
        conn = get_db_connection()
        cur = conn.execute("DELETE FROM pipelines WHERE id = ?", (pipeline_id,))
        conn.commit()
        deleted = cur.rowcount
        conn.close()

        if deleted == 0:
            return {"error": "Pipeline not found"}

        return {"message": "Pipeline deleted"}

    except Exception as e:
        return {"error": str(e)}

@app.post("/pipelines/save")
def save_pipeline(req: SavePipelineRequest):
    try:
        pipeline_id = str(uuid.uuid4())

        conn = get_db_connection()
        conn.execute(
            "INSERT INTO pipelines (id, name, nodes, edges, input_values, savedAt) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                pipeline_id,
                req.name,
                json.dumps([n.dict() for n in req.nodes]),
                json.dumps([e.dict() for e in req.edges]),
                json.dumps(req.input_values),
                datetime.utcnow().isoformat(),
            ),
        )
        conn.commit()
        conn.close()

        return {
            "message": "Pipeline saved",
            "id": pipeline_id
        }

    except Exception as e:
        return {
            "error": str(e)
        }

@app.get("/pipelines")
def get_pipelines():
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT id, name, nodes, edges, input_values, savedAt FROM pipelines ORDER BY savedAt DESC"
    ).fetchall()
    conn.close()

    pipelines = []
    for row in rows:
        pipelines.append({
            "id": row["id"],
            "name": row["name"],
            "nodes": json.loads(row["nodes"]),
            "edges": json.loads(row["edges"]),
            "input_values": json.loads(row["input_values"]),
            "savedAt": row["savedAt"],
        })

    return pipelines
# =========================
# Cycle Detection
# =========================

def find_all_cycles(nodes: List[Node], edges: List[Edge]) -> List[List[str]]:
    graph = defaultdict(list)

    for edge in edges:
        if edge.source == edge.target:
            continue
        graph[edge.source].append(edge.target)

    visited = set()
    all_cycles = []
    found_cycle_sets = []
    rec_stack = []
    rec_stack_set = set()

    def dfs(node):
        visited.add(node)
        rec_stack.append(node)
        rec_stack_set.add(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                dfs(neighbor)
            elif neighbor in rec_stack_set:
                cycle_start = rec_stack.index(neighbor)
                cycle = rec_stack[cycle_start:] + [neighbor]
                cycle_key = frozenset(cycle)
                if cycle_key not in found_cycle_sets:
                    found_cycle_sets.append(cycle_key)
                    all_cycles.append(cycle)

        rec_stack.pop()
        rec_stack_set.remove(node)

    for node in [n.id for n in nodes]:
        if node not in visited:
            dfs(node)

    return all_cycles


# =========================
# DAG Check (Kahn's Algo)
# =========================

def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    graph = defaultdict(list)
    indegree = {node.id: 0 for node in nodes}

    for edge in edges:
        graph[edge.source].append(edge.target)
        indegree[edge.target] += 1

    queue = deque([n for n in indegree if indegree[n] == 0])
    visited = 0

    while queue:
        node = queue.popleft()
        visited += 1
        for nei in graph[node]:
            indegree[nei] -= 1
            if indegree[nei] == 0:
                queue.append(nei)

    return visited == len(nodes)


async def run_node_logic(node, inputs, input_values, nodes):
    node_type = node.type

    if hasattr(node, "data") and node.data and "type" in node.data:
        node_type = node.data["type"]

    input_val = None  

    if inputs:
        first_val = next(iter(inputs.values()))

        if isinstance(first_val, list):
            extracted = []

            for v in first_val:
                if isinstance(v, dict) and "value" in v:
                    extracted.append(v["value"])   
                else:
                    extracted.append(v)

            if all(v is None for v in extracted):
                input_val = None
            else:
                input_val = " ".join(
                    str(v).strip() for v in extracted if v is not None
                )

        else:
            
            input_val = first_val

   
    if isinstance(input_val, list):
        if all(v is None for v in input_val):
            input_val = None
        else:
            input_val = " ".join(str(v) for v in input_val if v is not None)

    # =========================
    # INPUT NODE
    # =========================
    if node_type in ["input", "customInput"]:
        return input_values.get(node.id, None)

    # =========================
    # TEXT NODE
    # =========================
    elif node_type == "text":
        template = node.data.get("text", "")

        result = template

        # Replace placeholders if used
        for key, vals in inputs.items():
            if not isinstance(vals, list):
                vals = [vals]

            replacement = " ".join(
                str(v["value"]).strip() if isinstance(v, dict) else str(v).strip()
                for v in vals if v is not None
            )

            variable_name = key.replace(f"{node.id}-", "")
            result = result.replace(f"{{{{{variable_name}}}}}", replacement)

        if "{{" not in template and inputs:
            appended = []

            for vals in inputs.values():
                if isinstance(vals, list):
                    appended.extend(
                        str(v["value"]) if isinstance(v, dict) else str(v)
                        for v in vals if v is not None
                    )
                else:
                    appended.append(
                        str(vals["value"]) if isinstance(vals, dict) else str(vals)
                    )

            result = " ".join(appended) + (" " if template else "") + template

        final = " ".join(result.split())
        return final if final else None

    elif node_type == "filter":
        keyword = node.data.get("keyword", "")
        if input_val is None:
            return None

        input_str = str(input_val)

        return input_str if keyword in input_str else None

    elif node_type == "condition":
        value = node.data.get("value", "")
        cond_type = node.data.get("conditionType", "contains")

        if input_val is None:
            return {
                "result": False,
                f"{node.id}-true": None,
                f"{node.id}-false": None,
            }

        input_str = str(input_val)

        is_true = False

        if cond_type == "contains":
            is_true = value in input_str

        elif cond_type == "equals":
            is_true = input_str == value

        elif cond_type == "startsWith":
            is_true = input_str.startswith(value)

        elif cond_type == "endsWith":
            is_true = input_str.endswith(value)

        
        return {
            "result": is_true, 
            f"{node.id}-true": input_str if is_true else None,
            f"{node.id}-false": input_str if not is_true else None,
        }

    elif node_type == "transform":
        operation = node.data.get("operation", "uppercase")

        
        if input_val is None:
            return None

        input_str = str(input_val)

        if operation == "uppercase":
            return input_str.upper()

        elif operation == "lowercase":
            return input_str.lower()

        elif operation == "reverse":
            return input_str[::-1]

        elif operation == "trim":
            return input_str.strip()

        return input_str
    
    elif node_type == "merge":
        merged = []

        for vals in inputs.values():
            if isinstance(vals, list):
                merged.extend(
                    str(v["value"]) if isinstance(v, dict) else str(v)
                    for v in vals if v is not None
                )
            else:
                merged.append(
                    str(vals["value"]) if isinstance(vals, dict) else str(vals)
                )

        return " ".join(" ".join(merged).split())

    elif node_type == "delay":
        delay_seconds = float(node.data.get("seconds", 1))
        delay_seconds = max(0, min(10, delay_seconds))

       
        if not input_val:
            return None

  
        await asyncio.sleep(delay_seconds)

        return input_val
        
    elif node_type == "prompt":
        template = node.data.get("template", "")

        result = template

        for key, vals in inputs.items():
            if not isinstance(vals, list):
                vals = [vals]

            replacement = " ".join(
                str(v["value"]).strip() if isinstance(v, dict) else str(v).strip()
                for v in vals if v is not None
            )

            variable_name = key.replace(f"{node.id}-", "")
            result = result.replace(f"{{{{{variable_name}}}}}", replacement)

        if "{{" not in template and inputs:
            appended = []

            for vals in inputs.values():
                if isinstance(vals, list):
                    appended.extend(
                        str(v["value"]).strip() if isinstance(v, dict) else str(v).strip()
                        for v in vals if v is not None
                    )
                else:
                    appended.append(
                        str(vals["value"]).strip() if isinstance(vals, dict) else str(vals).strip()
                    )

            result = " ".join([template.strip()] + appended).strip()

        final = " ".join(result.split())
        return final if final else None
    elif node_type == "llm":
        prompt_key = f"{node.id}-prompt"

        prompt_vals = []
        other_vals = []

        for key, vals in inputs.items():
            if not vals:
                continue

            for item in vals:
                val = item["value"]
                source_id = item["source"]

                # find source node
                source_node = next(n for n in nodes if n.id == source_id)

                if val is None:
                    continue  

                cleaned = str(val).strip()

                if key == prompt_key:
                   
                    if source_node.type == "prompt":
                        prompt_vals.append(cleaned)
                    else:
                        continue  

                else:
                    
                    other_vals.append(cleaned)

      

        if prompt_vals and other_vals:
            return " ".join(prompt_vals + other_vals)

        elif prompt_vals:
            return " ".join(prompt_vals)

        elif other_vals:
            return " ".join(other_vals)

        return None
   
    elif node_type in ["output", "customOutput"]:
        if input_val is None:
            return None
        return " ".join(str(input_val).split())

    return None

async def execute_pipeline(nodes, edges, input_values):
    graph = defaultdict(list)
    indegree = {node.id: 0 for node in nodes}

    # build graph
    for edge in edges:
        graph[edge.source].append(edge.target)
        indegree[edge.target] += 1

    queue = deque([n for n in indegree if indegree[n] == 0])

    outputs = {}

    while queue:
        node_id = queue.popleft()
        node = next(n for n in nodes if n.id == node_id)

      
        incoming_edges = [e for e in edges if e.target == node_id]

        mapped_inputs = {}

        for e in incoming_edges:
            source_output = outputs.get(e.source)

            if source_output is None:
                if e.targetHandle not in mapped_inputs:
                    mapped_inputs[e.targetHandle] = []

                mapped_inputs[e.targetHandle].append({
                    "value": None,
                    "source": e.source
                })
                continue

            if isinstance(source_output, dict):
                val = source_output.get(e.sourceHandle)
            else:
                val = source_output

            if val is not None:
                if e.targetHandle not in mapped_inputs:
                    mapped_inputs[e.targetHandle] = []

                mapped_inputs[e.targetHandle].append({
                    "value": val,
                    "source": e.source
                })

      
        result = await run_node_logic(node, mapped_inputs, input_values, nodes)

       
        outputs[node_id] = result

      
        for nei in graph[node_id]:
            indegree[nei] -= 1
            if indegree[nei] == 0:
                queue.append(nei)

    return outputs

# =========================
# Routes
# =========================

@app.get("/")
def read_root():
    return {"Ping": "Pong"}


@app.post("/pipelines/parse")
def parse_pipeline(pipeline: Pipeline):
    nodes = pipeline.nodes
    edges = pipeline.edges

    num_nodes = len(nodes)
    num_edges = len(edges)

    errors = []
    cycles = []

    if num_nodes == 0:
        errors.append("Pipeline has no nodes")

    node_ids = [node.id for node in nodes]
    if len(set(node_ids)) != len(node_ids):
        errors.append("Duplicate node IDs detected")

    node_id_set = set(node_ids)

    for edge in edges:
        if edge.source not in node_id_set or edge.target not in node_id_set:
            errors.append(f"Invalid edge: {edge.source} → {edge.target}")

    for edge in edges:
        if edge.source == edge.target:
            errors.append(f"Self-loop detected at node: {edge.source}")

    if num_nodes > 0:
        dag_status = is_dag(nodes, edges)
        if not dag_status:
            has_self_loop = any("Self-loop" in e for e in errors)
            cycles = find_all_cycles(nodes, edges)

            if cycles:
                for cycle in cycles:
                    cycle_str = " → ".join(cycle)
                    if has_self_loop:
                        errors.append(f"Multi-node cycle detected: {cycle_str}")
                    else:
                        errors.append(f"Cycle detected: {cycle_str}")
            elif has_self_loop:
                pass
            else:
                errors.append("Graph contains a cycle")
    else:
        dag_status = False

    return {
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "is_dag": dag_status,
        "cycles": cycles,
        "errors": errors,
        "message": (
            "Valid DAG ✅"
            if dag_status and not errors
            else "Graph has issues ⚠️"
        )
    }


@app.post("/pipelines/execute")
async def run_pipeline(request: ExecuteRequest):
    nodes = request.nodes
    edges = request.edges
    input_values = request.input_values

    if not is_dag(nodes, edges):
        return {
            "error": "Pipeline is not a DAG"
        }

    outputs = await execute_pipeline(nodes, edges, input_values)

    return {
        "outputs": outputs
    }