import React from "react";
import { BaseNode, NodeField, NodeInput, NodeValueDisplay } from "./BaseNode";
import { useStore } from "../store";

export default function FilterNode({ id, data }) {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const outputs = useStore((state) => state.outputs);

  const keyword = data?.keyword ?? "";
  const currentValue = outputs[id] || "";
  const number = id.split("-")[1] || "1";

  return (
    <BaseNode
      type="filter"
      title={`Filter ${number}`}
      inputs={[{ id: `${id}-input`, label: "In" }]}
      outputs={[{ id: `${id}-output`, label: "Out" }]}
      width={300}
    >
      <div style={{ width: "100%" }}>
        <NodeField
          label={
            <span
              style={{
                color: "#e2e8f0",
                fontWeight: 500,
                fontSize: "12px",
              }}
            >
              Keyword
            </span>
          }
        >
          <NodeInput
            value={keyword}
            onChange={(e) =>
              updateNodeField(id, "keyword", e.target.value)
            }
            placeholder="Enter keyword to match..."
            style={{
              color: "#f8fafc",
              fontSize: "13px",
            }}
          />
        </NodeField>

        <NodeField
          label={
            <span
              style={{
                color: "#e2e8f0",
                fontWeight: 500,
                fontSize: "12px",
              }}
            >
              Current Value
            </span>
          }
        >
          <NodeValueDisplay
            value={currentValue || "—"}
            title={String(currentValue)}
          />
        </NodeField>

        <div
          style={{
            marginTop: "8px",
            padding: "6px 8px",
            borderRadius: "6px",
            background: "rgba(234, 179, 8, 0.06)",
            border: "1px solid rgba(234, 179, 8, 0.2)",
            fontSize: "10px",
            fontWeight: 500,
            color: "#facc15",
            textAlign: "center",
          }}
        >
          {currentValue ? "✓ Passes filter" : "✕ Filtered out"}
        </div>
      </div>
    </BaseNode>
  );
}