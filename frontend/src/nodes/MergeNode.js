import React from "react";
import { BaseNode, NodeField, NodeValueDisplay } from "./BaseNode";
import { useStore } from "../store";

function MergeNode({ id }) {
  const outputs = useStore((state) => state.outputs);

  const currentValue = outputs[id] || "";
  const number = id.split("-")[1] || "1";

  return (
    <BaseNode
      type="merge"
      title={`Merge ${number}`}
      inputs={[
        { id: `${id}-input1`, label: "In 1" },
        { id: `${id}-input2`, label: "In 2" }
      ]}
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
              Merged Output
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
            background: "rgba(20, 184, 166, 0.06)",
            border: "1px solid rgba(20, 184, 166, 0.2)",
            fontSize: "10px",
            fontWeight: 500,
            color: "#2dd4bf",
            textAlign: "center",
          }}
        >
          Combines both inputs
        </div>
      </div>
    </BaseNode>
  );
}

export default React.memo(MergeNode);