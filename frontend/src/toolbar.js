import { DraggableNode } from './draggableNode';
import "./toolbar.css";

// 🔥 Central config (clean + scalable)
const nodes = [
  { type: 'customInput', label: 'INPUT' },
  { type: 'llm', label: 'LLM' },
  { type: 'customOutput', label: 'OUTPUT' },
  { type: 'text', label: 'TEXT' },
  { type: 'transform', label: 'TRANSFORM' },
  { type: 'condition', label: 'CONDITION' },
  { type: 'delay', label: 'DELAY' },
  { type: 'merge', label: 'MERGE' },
  { type: 'filter', label: 'FILTER' },
  { type: 'prompt', label: 'PROMPT' },
];

export const PipelineToolbar = () => {
  return (
    <div className="toolbar-root">

      {/* HEADER */}
      <div className="toolbar-header">
        <div className="toolbar-title">Nodes</div>
        <div className="toolbar-main-title">Pipeline Builder</div>
      </div>

      {/* NODES */}
      <div className="toolbar-nodes">
        {nodes.map((node) => (
          <DraggableNode
            key={node.type}
            type={node.type}
            label={node.label}
          />
        ))}
      </div>

    </div>
  );
};