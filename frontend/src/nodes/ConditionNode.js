import { useStore } from "../store";
import { BaseNode, NodeField, NodeSelect, NodeInput } from "./BaseNode";

export default function ConditionNode({ id, data }) {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const outputs = useStore((s) => s.outputs);

  const conditionType = data?.conditionType || "contains";
  const value = data?.value || "";
  const number = id.split("-")[1] || "1";
  const result = outputs?.[id];

  const isTrue =
    result && typeof result === "object"
      ? result[`${id}-true`] !== null && result[`${id}-true`] !== undefined
      : false;

  return (
    <BaseNode
      type="condition"
      title={`Condition ${number}`}
      inputs={[{ id: `${id}-input`, label: "In" }]}
      outputs={[
        {
          id: `${id}-true`,
          label: "TRUE",
        },
        {
          id: `${id}-false`,
          label: "FALSE",
        },
      ]}
      width={300}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "10px",
          }}
        >
          <div
            className="node-status-dot"
            style={{
              backgroundColor: isTrue ? "#22c55e" : "#ef4444",
            }}
          />
        </div>

        <NodeField
          label={
            <span
              style={{
                color: "#e2e8f0",
                fontWeight: 500,
                fontSize: "12px",
              }}
            >
              Type
            </span>
          }
        >
          <NodeSelect
            value={conditionType}
            onChange={(e) =>
              updateNodeData(id, { conditionType: e.target.value })
            }
            style={{
              background: "#0f172a",
              color: "#f8fafc",
              border: "1px solid #475569",
              fontSize: "13px",
            }}
          >
            <option value="contains">Contains</option>
            <option value="equals">Equals</option>
            <option value="startsWith">Starts With</option>
            <option value="endsWith">Ends With</option>
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
              Value
            </span>
          }
        >
          <NodeInput
            value={value}
            onChange={(e) =>
              updateNodeData(id, { value: e.target.value })
            }
            placeholder="Enter value..."
            style={{
              fontSize: "13px",
              color: "#f8fafc",
            }}
          />
        </NodeField>
      </div>
    </BaseNode>
  );
}