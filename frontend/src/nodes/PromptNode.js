import { useStore } from "../store";
import { BaseNode } from "./BaseNode";
import { useUpdateNodeInternals } from "reactflow";
import { useEffect } from "react";

export default function PromptNode({ id, data }) {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const outputs = useStore((s) => s.outputs);
  const updateNodeInternals = useUpdateNodeInternals();

  const template =
    data?.template !== undefined ? data.template : "Explain this:";
  const outputValue = outputs?.[id];
  const number = id.split("-")[1] || "1";

  const displayValue =
    outputValue !== undefined && outputValue !== null
      ? String(outputValue)
      : "—";

  const longestLine = Math.max(
    18,
    ...displayValue.split("\n").map((l) => l.length)
  );

  const dynamicWidth = Math.min(500, Math.max(260, longestLine * 7));

  useEffect(() => {
    updateNodeInternals(id);
  }, [displayValue, dynamicWidth, id, updateNodeInternals]);

  return (
    <BaseNode
      type="prompt"
      title={`Prompt ${number}`}
      inputs={[{ id: `${id}-input`, label: "Input" }]}
      outputs={[{ id: `${id}-output`, label: "Prompt" }]}
      width={dynamicWidth}
    >
      <div style={{ width: "100%" }}>
        {/* TEMPLATE INPUT */}
        <textarea
          value={template}
          onChange={(e) =>
            updateNodeField(id, "template", e.target.value)
          }
          rows={2}
          placeholder="Prompt template..."
          style={{
            width: "100%",
            minHeight: "50px",
            padding: "6px 8px",
            borderRadius: "6px",
            border: "1px solid #475569",
            background: "#0f172a",
            color: "#f8fafc",
            outline: "none",
            boxSizing: "border-box",
            fontSize: "13px",
            fontWeight: 500,
            resize: "none",
          }}
        />

        {/* OUTPUT DISPLAY (FIXED) */}
        <div
          className="node-value-display"
          title={displayValue}
          style={{
            marginTop: "8px",
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
      </div>
    </BaseNode>
  );
}