import { Handle, Position } from "reactflow";
import "./BaseNode.css";

const HANDLE_OFFSET = 28;

export const nodeColors = {
  customInput: "#3b82f6",
  llm: "#8b5cf6",
  customOutput: "#22c55e",
  text: "#0ea5e9",
  transform: "#f59e0b",
  condition: "#ef4444",
  delay: "#a855f7",
  merge: "#14b8a6",
  filter: "#eab308",
  prompt: "#ec4899",
};

const nodeGlows = {
  customInput: "0 0 20px 3px rgba(59,130,246,0.3)",
  llm: "0 0 20px 3px rgba(139,92,246,0.3)",
  customOutput: "0 0 20px 3px rgba(34,197,94,0.3)",
  text: "0 0 20px 3px rgba(14,165,233,0.3)",
  transform: "0 0 20px 3px rgba(245,158,11,0.3)",
  condition: "0 0 20px 3px rgba(239,68,68,0.3)",
  delay: "0 0 20px 3px rgba(168,85,247,0.3)",
  merge: "0 0 20px 3px rgba(20,184,166,0.3)",
  filter: "0 0 20px 3px rgba(234,179,8,0.3)",
  prompt: "0 0 20px 3px rgba(236,72,153,0.3)",
};

export const nodeIcons = {
  customInput: "⏎",
  llm: "⬡",
  customOutput: "⏏",
  text: "✎",
  transform: "⇄",
  condition: "◇",
  delay: "◷",
  merge: "◉",
  filter: "◳",
  prompt: "✦",
};

export const BaseNode = ({
  type,
  title,
  inputs = [],
  outputs = [],
  children,
  width,
  selected,
}) => {
  const headerColor = nodeColors[type] || "#334155";
  const glowShadow = nodeGlows[type] || "0 0 20px 3px rgba(100,116,139,0.2)";
  const icon = nodeIcons[type] || "◉";
  const SPACING = 36;
  const minHeight = Math.max(inputs.length, outputs.length) * SPACING + 40;

  return (
    <div
      className={`base-node${selected ? " selected" : ""}`}
      style={{
        minWidth: 260,
        width: width,
        boxShadow: selected
          ? `${glowShadow}, 0 16px 48px rgba(0,0,0,0.56)`
          : `0 8px 32px rgba(0,0,0,0.48)`,
      }}
    >
      {/* HEADER */}
      <div
        className="base-node-header"
        style={{
          background: `linear-gradient(135deg, ${headerColor}dd 0%, ${headerColor}88 100%)`,
        }}
      >
        <span className="base-node-header-icon">{icon}</span>
        <span style={{ position: "relative", zIndex: 1 }}>{title}</span>
      </div>

      <div className="base-node-divider" />

      {/* BODY */}
      <div
        className="base-node-body"
        style={{
          minHeight,
        }}
      >
        {/* LEFT INPUTS */}
        <div className="base-node-io-col left">
          {inputs.map((input, idx) => {
            const id = typeof input === "string" ? input : input.id;
            const label = typeof input === "string" ? input : input.label;
            return (
              <div key={`${id}-${idx}`} className="base-node-io-item">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={id}
                  style={{
                    left: -HANDLE_OFFSET,
                    background: headerColor,
                    width: 10,
                    height: 10,
                    border: "2px solid rgba(255,255,255,0.2)",
                    boxShadow: `0 0 8px 1px ${headerColor}aa`,
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    borderRadius: "50%",
                    cursor: "crosshair",
                    zIndex: 10,
                  }}
                />
                <span className="base-node-io-label">{label}</span>
              </div>
            );
          })}
        </div>

        {/* CENTER CONTENT */}
        <div className="base-node-content">{children}</div>

        {/* RIGHT OUTPUTS */}
        <div className="base-node-io-col right">
          {outputs.map((output, idx) => {
            const id = typeof output === "string" ? output : output.id;
            const label = typeof output === "string" ? output : output.label;

            let handleColor = headerColor;
            let handleGlow = `0 0 8px 1px ${headerColor}aa`;

            if (id.includes("true")) {
              handleColor = "#22c55e";
              handleGlow = "0 0 8px 2px rgba(34,197,94,0.8)";
            } else if (id.includes("false")) {
              handleColor = "#ef4444";
              handleGlow = "0 0 8px 2px rgba(239,68,68,0.8)";
            }

            return (
              <div key={`${id}-${idx}`} className="base-node-io-item">
                <span className="base-node-io-label">{label}</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={id}
                  style={{
                    right: -HANDLE_OFFSET,
                    background: handleColor,
                    width: 10,
                    height: 10,
                    border: "2px solid rgba(255,255,255,0.2)",
                    boxShadow: handleGlow,
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    borderRadius: "50%",
                    cursor: "crosshair",
                    zIndex: 10,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const NodeField = ({ label, children }) => (
  <div className="node-field">
    {label && <div className="node-label">{label}</div>}
    {children}
  </div>
);

export const NodeInput = (props) => (
  <input className="node-input" {...props} />
);

export const NodeTextarea = (props) => (
  <textarea className="node-textarea" {...props} />
);

export const NodeSelect = ({ children, ...props }) => (
  <select className="node-select" {...props}>
    {children}
  </select>
);

export const NodeBadge = ({ children }) => (
  <span className="node-badge">{children}</span>
);

export const NodeValueDisplay = ({ value, title, style }) => (
  <div
    className="node-value-display"
    title={title || String(value)}
    style={{
      whiteSpace: "pre-wrap", // 👈 this is the key fix
      ...style,               // 👈 allow parent styles
    }}
  >
    {value !== undefined && value !== null ? String(value) : "null"}
  </div>
);