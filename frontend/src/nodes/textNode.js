import { useState, useEffect } from "react";
import { useStore } from "../store";
import { BaseNode, NodeField, NodeTextarea } from "./BaseNode";
import { useUpdateNodeInternals } from "reactflow";

export const TextNode = ({ id, data }) => {
  const outputs = useStore((s) => s.outputs);
  const updateNodeInternals = useUpdateNodeInternals();

  const [currText, setCurrText] = useState(data?.text || "");
  const outputValue = outputs?.[id];
  const number = id.split("-")[1] || "1";

  useEffect(() => {
    data.text = currText;
    updateNodeInternals(id);
  }, [currText, data, id, updateNodeInternals]);

  const variables = [
    ...new Set(
      (currText.match(/\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g) || []).map((v) =>
        v.replace(/\{\{|\}\}/g, "").trim()
      )
    ),
  ];

  const inputs =
    variables.length > 0
      ? variables.map((v) => ({
          id: `${id}-${v}`,
          label: v,
        }))
      : [{ id: `${id}-input`, label: "Input" }];

  const longestLine = Math.max(
    18,
    ...currText.split("\n").map((l) => l.length),
    String(outputValue ?? "null").length + 8
  );

  const dynamicWidth = Math.min(420, Math.max(260, longestLine * 6.8));

  return (
    <BaseNode
      type="text"
      title={`Text ${number}`}
      inputs={inputs}
      outputs={[{ id: `${id}-output`, label: "Out" }]}
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
              Template
            </span>
          }
        >
          <NodeTextarea
            value={currText}
            onChange={(e) => setCurrText(e.target.value)}
            rows={Math.max(2, currText.split("\n").length)}
            placeholder="Enter text with {{variables}}"
            style={{
              minHeight: "60px",
              fontSize: "13px",
              color: "#f8fafc",
            }}
          />
        </NodeField>

        <div style={{ marginTop: "8px" }}>
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
            <div
              className="node-input"
              title={outputValue ?? "null"}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: "default",
                userSelect: "text",
                padding: "8px 10px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#dbeafe",
                minHeight: "32px",
                display: "flex",
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.02)",
              }}
            >
              {outputValue !== undefined && outputValue !== null
                ? String(outputValue)
                : "null"}
            </div>
          </NodeField>
        </div>
      </div>
    </BaseNode>
  );
};