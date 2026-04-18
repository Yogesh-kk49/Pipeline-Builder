import { useStore } from "../store";
import { BaseNode, NodeField, NodeInput, NodeValueDisplay } from "./BaseNode";

export const InputNode = ({ id }) => {
  const inputValues = useStore((s) => s.inputValues);
  const setInputValue = useStore((s) => s.setInputValue);
  const outputs = useStore((s) => s.outputs);

  const number = id.split("-")[1] || "1";
  const value = inputValues[id] ?? "";
  const outputValue = outputs?.[id];

  return (
    <BaseNode
      type="customInput"
      title={`Input ${number}`}
      outputs={[{ id: `${id}-value`, label: "Value" }]}
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
              Data
            </span>
          }
        >
          <NodeInput
            type="text"
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              setInputValue(id, val === "" ? null : val);
            }}
            placeholder="Enter value..."
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
              Output Preview
            </span>
          }
        >
          <NodeValueDisplay
            value={outputValue}
            title={String(outputValue)}
            style={{
              color: "#dbeafe",
              fontWeight: 500,
              fontSize: "13px",
              whiteSpace: "pre-wrap",
            }}
          />
        </NodeField>
      </div>
    </BaseNode>
  );
};