import { BaseNode, NodeField } from "./BaseNode";

export const LLMNode = ({ id }) => {
  const number = id.split("-")[1] || "1";

  return (
    <BaseNode
      type="llm"
      title={`LLM ${number}`}
      inputs={[
        { id: `${id}-system`, label: "System" },
        { id: `${id}-prompt`, label: "Prompt" }
      ]}
      outputs={[
        { id: `${id}-response`, label: "Response" }
      ]}
      width={300}
    >
      <div style={{ width: "100%" }}>
        <NodeField>
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              background: "rgba(139, 92, 246, 0.08)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              fontSize: "13px",
              fontWeight: 500,
              color: "#e9d5ff",
              lineHeight: "1.5",
              textAlign: "center",
            }}
          >
            AI Processing Node
          </div>
        </NodeField>

        <div
          style={{
            marginTop: "8px",
            padding: "8px",
            borderRadius: "6px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px dashed rgba(255, 255, 255, 0.08)",
            fontSize: "10px",
            fontWeight: 500,
            color: "#cbd5e1",
            textAlign: "center",
          }}
        >
          Combines system & prompt inputs
        </div>
      </div>
    </BaseNode>
  );
};