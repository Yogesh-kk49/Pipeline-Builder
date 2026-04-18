import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap, ControlButton } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import TransformNode from './nodes/TransformNode';
import ConditionNode from './nodes/ConditionNode';
import DelayNode from './nodes/DelayNode';
import MergeNode from './nodes/MergeNode';
import FilterNode from './nodes/FilterNode';
import PromptNode from './nodes/PromptNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  transform: TransformNode,
  condition: ConditionNode,
  delay: DelayNode,
  merge: MergeNode,
  filter: FilterNode,
  prompt: PromptNode,
};

const labelNames = {
  customInput: "Input",
  llm: "LLM",
  customOutput: "Output",
  text: "Text",
  transform: "Transform",
  condition: "Condition",
  delay: "Delay",
  merge: "Merge",
  filter: "Filter",
  prompt: "Prompt",
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  clearAll: state.clearAll,
  inputValues: state.inputValues,
  setOutputs: state.setOutputs,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const isRunningRef = useRef(false);
  const abortRef = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    clearAll,
    inputValues,
    setOutputs,
  } = useStore(selector, shallow);

  // 🔥 EXECUTION FUNCTION
  const requestIdRef = useRef(0);

  const runPipeline = async () => {
    const requestId = ++requestIdRef.current;

    // cancel previous
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/pipelines/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodes,
          edges,
          input_values: inputValues,
        }),
        signal: controller.signal,
      });

      const data = await res.json();

      // 🔥 ONLY APPLY LATEST RESPONSE
      if (requestId === requestIdRef.current) {
        if (data.outputs) {
          setOutputs(data.outputs);
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Execution error:", err);
    }
  };
  // 🔥 AUTO FLOW
  useEffect(() => {
    if (nodes.length === 0) return;

    const timer = setTimeout(() => {
      runPipeline();
    }, 80);
    return () => clearTimeout(timer);
  }, [nodes, edges, inputValues]);

  const getInitNodeData = (nodeID, type, backendType) => {
    const count = nodeID.split('-').pop();
    const baseName = labelNames[type] || type;

    const data = {
      id: nodeID,
      type: backendType,
      label: `${baseName} ${count}`,
    };

    if (type === "prompt") {
      data.template = "Explain this:";
    }

    return data;
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const rawData = event.dataTransfer.getData('application/reactflow');

      if (!rawData) return;

      const appData = JSON.parse(rawData);

      const type = appData?.nodeType;
      const backendType = appData?.backendType || type;

      if (!type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeID = getNodeID(type);

      addNode({
        id: nodeID,
        type, // UI rendering type
        position,
        data: getInitNodeData(nodeID, type, backendType),
      });
    },
    [reactFlowInstance, getNodeID, addNode]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div
      ref={reactFlowWrapper}
      style={{ width: '100vw', height: '70vh', background: '#0f172a' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType="smoothstep"
      >
        <Background color="#444" gap={gridSize} />

        <Controls>
          <ControlButton
            onClick={clearAll}
            title="Clear all nodes and edges"
            style={{
              color: '#1f2937',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            ✕
          </ControlButton>
        </Controls>

        <MiniMap />
      </ReactFlow>
    </div>
  );
};