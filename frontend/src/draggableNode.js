import React from "react";
import { nodeColors, nodeIcons } from "./nodes/BaseNode";
import "./draggableNode.css";

// 🔥 MAP FRONTEND → BACKEND TYPES
const backendTypeMap = {
  customInput: "input",
  customOutput: "output",
  text: "text",
  transform: "transform",   // or whatever your backend logic expects
  filter: "filter",
  merge: "merge",
  delay: "delay",
  condition: "condition",
  prompt: "prompt",
  llm: "llm", // or "llm" if you support it in backend
};

export const DraggableNode = ({ type, label }) => {
  const color = nodeColors[type] || "#1C2536";
  const icon = nodeIcons[type] || "◉";

  const onDragStart = (event) => {
    const backendType = backendTypeMap[type] || type;

    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({
        nodeType: type,        // frontend type (UI)
        backendType: backendType, // 🔥 actual execution type
      })
    );

    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="draggable-node"
      draggable
      onDragStart={onDragStart}
      style={{
        "--node-bg": `linear-gradient(135deg, ${color}dd 0%, ${color}99 100%)`,
        "--node-shadow": `0 2px 10px ${color}55`,
        "--node-shadow-hover": `0 6px 18px ${color}88`,
      }}
    >
      <span className="draggable-node-icon">{icon}</span>
      <span className="draggable-node-label">{label}</span>
    </div>
  );
};