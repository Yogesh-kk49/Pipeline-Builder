import { useState, useEffect, useRef } from "react";
import { useStore } from "../store";
import { BaseNode, NodeField, NodeTextarea, NodeValueDisplay } from "./BaseNode";
import { useUpdateNodeInternals } from "reactflow";

export const TextNode = ({ id, data }) => {
  const outputs = useStore((s) => s.outputs);
  const updateNodeInternals = useUpdateNodeInternals();

  const [currText, setCurrText] = useState(data?.text || "");
  const textareaRef = useRef(null);
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
      ? variables.map((v) => ({ id: `${id}-${v}`, label: v }))
      : [{ id: `${id}-input`, label: "Input" }];

  const handleChange = (e) => {
  setCurrText(e.target.value);
  const el = e.target;

  el.style.height = "auto";  // ← key fix: lets browser recalculate scrollHeight
  el.style.overflowY = "hidden";

  if (el.scrollHeight > 120) {
    el.style.height = "120px";
    el.style.overflowY = "auto";
  } else if (el.scrollHeight < 32) {
    el.style.height = "32px";  // never go below minimum
  } else {
    el.style.height = el.scrollHeight + "px";
  }
};

  return (
    <BaseNode
      type="text"
      title={`Text ${number}`}
      inputs={inputs}
      outputs={[{ id: `${id}-output`, label: "Out" }]}
      width={280}  // fixed width, same as InputNode
    >
      <div style={{ width: "100%" }}>
        <NodeField
          label={
            <span style={{ color: "#e2e8f0", fontWeight: 500, fontSize: "12px" }}>
              Template
            </span>
          }
        >
          <NodeTextarea
            ref={textareaRef}
            value={currText}
            onChange={handleChange}
            rows={1}
            placeholder="Enter text"
            style={{
              fontSize: "13px",
              color: "#f8fafc",
              width: "100%",
              resize: "none",
              padding: "6px 8px",
              lineHeight: "1.4",
              height: "32px",
              minHeight: "32px",
              maxHeight: "120px",
              overflowY: "hidden",
              overflowX: "hidden",
              boxSizing: "border-box",
            }}
          />
        </NodeField>

        <div style={{ marginTop: "8px" }}>
          <NodeField
            label={
              <span style={{ color: "#e2e8f0", fontWeight: 500, fontSize: "12px" }}>
                Current Value
              </span>
            }
          >
            <NodeValueDisplay
              value={
                outputValue !== undefined && outputValue !== null
                  ? String(outputValue)
                  : "null"
              }
              title={
                outputValue !== undefined && outputValue !== null
                  ? String(outputValue)
                  : "null"
              }
            />
          </NodeField>
        </div>
      </div>
    </BaseNode>
  );
};