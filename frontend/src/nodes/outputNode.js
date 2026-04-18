import { useStore } from "../store";
import { BaseNode, NodeField } from "./BaseNode";
import { useUpdateNodeInternals } from "reactflow";
import { useEffect } from "react";

export const OutputNode = ({ id }) => {
  const outputs = useStore((s) => s.outputs);

  const updateNodeInternals = useUpdateNodeInternals();

  const value = outputs?.[id];
  const number = id.split("-")[1] || "1";

  const displayValue =
    value !== undefined && value !== null ? String(value) : "null";

  const longestLine = Math.max(
    18,
    ...displayValue.split("\n").map((l) => l.length)
  );

  const dynamicWidth = Math.min(500, Math.max(260, longestLine * 7));

  // 🔥 THIS FIXES YOUR ISSUE
  useEffect(() => {
    requestAnimationFrame(() => {
      updateNodeInternals(id);
    });
  }, [displayValue, dynamicWidth]);

  return (
    <BaseNode
      type="customOutput"
      title={`Output ${number}`}
      inputs={[{ id: `${id}-value`, label: "Value" }]}
      width={dynamicWidth}
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
              Received Value
            </span>
          }
        >
          <div
            className="node-value-display"
            title={displayValue}
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              minHeight: "32px",
              padding: "8px 10px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#dbeafe",
            }}
          >
            {displayValue}
          </div>
        </NodeField>
      </div>
    </BaseNode>
  );
};