import { useState, useEffect } from "react";
import { useStore } from "../store";
import { BaseNode, NodeField, NodeSelect, NodeValueDisplay } from "./BaseNode";
import { useUpdateNodeInternals } from "reactflow";

export default function TransformNode({ id, data }) {
  const outputs = useStore((s) => s.outputs);
  const updateNodeData = useStore((s) => s.updateNodeData);
  const updateNodeInternals = useUpdateNodeInternals();

  const number = id.split("-")[1] || "1";

  const [transformType, setTransformType] = useState(
    data?.operation || "uppercase"
  );

  const outputValue = outputs?.[id];

  const formatOutput = (value) => {
    if (value == null || value === "none") return "null";
    if (Array.isArray(value)) return value.join(" ");
    return String(value);
  };

  useEffect(() => {
    if (data?.operation && data.operation !== transformType) {
      setTransformType(data.operation);
    }
  }, [data?.operation]);

  useEffect(() => {
    updateNodeData(id, { operation: transformType });
    updateNodeInternals(id);
  }, [transformType, id, updateNodeData, updateNodeInternals]);

  return (
    <BaseNode
      type="transform"
      title={`Transform ${number}`}
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
              Operation
            </span>
          }
        >
          <NodeSelect
            value={transformType}
            onChange={(e) => setTransformType(e.target.value)}
            style={{
              background: "#0f172a",
              color: "#f8fafc",
              border: "1px solid #475569",
              fontSize: "13px",
            }}
          >
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="reverse">Reverse</option>
            <option value="trim">Trim</option>
          </NodeSelect>
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
            value={formatOutput(outputValue)}
            title={formatOutput(outputValue)}
          />
        </NodeField>
      </div>
    </BaseNode>
  );
}