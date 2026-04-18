import React from "react";
import { BaseNode, NodeField, NodeInput } from "./BaseNode";
import { useStore } from "../store";

function DelayNode({ id, data }) {
  const updateNodeField = useStore((state) => state.updateNodeField);

  const delay = data?.seconds ?? 1;
  const number = id.split("-")[1] || "1";

  return (
    <BaseNode
      type="delay"
      title={`Delay ${number}`}
      inputs={[{ id: `${id}-input`, label: "In" }]}
      outputs={[{ id: `${id}-output`, label: "Out" }]}
      width={280}
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
              Delay (seconds)
            </span>
          }
        >
          <NodeInput
            type="number"
            value={delay}
            min={0}
            max={10}
            step={0.5}
            onChange={(e) => {
              let value = Number(e.target.value);

              if (isNaN(value)) value = 0;

              value = Math.max(0, Math.min(10, value));

              updateNodeField(id, "seconds", value);
            }}
            style={{
              MozAppearance: "textfield",
              color: "#f8fafc",
              fontSize: "13px",
            }}
          />
        </NodeField>

        <div
          style={{
            marginTop: "8px",
            padding: "6px 8px",
            borderRadius: "6px",
            background: "rgba(168, 85, 247, 0.06)",
            border: "1px solid rgba(168, 85, 247, 0.2)",
            fontSize: "11px",
            fontWeight: 500,
            color: "#c084fc",
            textAlign: "center",
          }}
        >
          {delay === 0 ? "No delay" : `${delay}s delay`}
        </div>
      </div>
    </BaseNode>
  );
}

export default React.memo(DelayNode);