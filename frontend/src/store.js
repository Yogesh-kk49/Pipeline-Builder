import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "reactflow";

export const useStore = create((set, get) => ({
  // =========================
  // STATE
  // =========================
  nodes: [],
  edges: [],
  nodeIDs: {},
  resetKey: 0,

  inputValues: {},
  outputs: {},

  // =========================
  // GENERATE UNIQUE NODE ID
  // =========================
  getNodeID: (type) => {
    const nodeIDs = { ...get().nodeIDs };

    nodeIDs[type] = (nodeIDs[type] || 0) + 1;

    set({ nodeIDs });

    return `${type}-${nodeIDs[type]}`;
  },

  // =========================
  // ADD NODE
  // =========================
  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
  },

  // =========================
  // SET NODES (used for loading saved pipelines)
  // =========================
  setNodes: (nodes) => {
    set({ nodes });
  },

  // =========================
  // SET EDGES (used for loading saved pipelines)
  // =========================
  setEdges: (edges) => {
    set({ edges });
  },

  // =========================
  // CLEAR ALL
  // =========================
  clearAll: () => {
    set((state) => ({
      nodes: [],
      edges: [],
      nodeIDs: {},
      resetKey: state.resetKey + 1,
      inputValues: {},
      outputs: {},
    }));
  },

  // =========================
  // NODE CHANGES
  // =========================
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  // =========================
  // EDGE CHANGES
  // =========================
  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  // =========================
  // CONNECT EDGES
  // =========================
  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          type: "smoothstep",
          animated: true,
          markerEnd: {
            type: MarkerType.Arrow,
            height: 20,
            width: 20,
          },
        },
        state.edges
      ),
    }));
  },

  // =========================
  // UPDATE SINGLE NODE FIELD
  // =========================
  updateNodeField: (nodeId, fieldName, fieldValue) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...(node.data || {}),
                [fieldName]: fieldValue,
              },
            }
          : node
      ),
    }));
  },

  // =========================
  // UPDATE MULTIPLE NODE DATA FIELDS
  // =========================
  updateNodeData: (nodeId, newData) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...(node.data || {}),
                ...newData,
              },
            }
          : node
      ),
    }));
  },

  // =========================
  // SET INPUT VALUE
  // =========================
  setInputValue: (nodeId, value) => {
    set((state) => ({
      inputValues: {
        ...state.inputValues,
        [nodeId]: value,
      },
    }));
  },
// =========================
// SET ALL INPUT VALUES (for loading)
// =========================
setInputValues: (values) => {
  set({ inputValues: values || {} });
},
  // =========================
  // SET EXECUTION OUTPUTS
  // =========================
  setOutputs: (outputs) => {
    set({
      outputs,
    });
  },
}));