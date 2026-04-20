import { DraggableNode } from './draggableNode';
import { useStore } from './store';
import { useState } from 'react';
import { MarkerType } from 'reactflow';
import "./toolbar.css";

const nodeList = [
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

const MAX_BADGES = 6;

const restoreEdgeStyles = (edges) =>
  (edges || []).map((edge) => ({
    ...edge,
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.Arrow, height: 20, width: 20 },
  }));

const restoreNodePositions = (nodes) =>
  (nodes || []).map((node, index) => ({
    ...node,
    position:
      node.position &&
      typeof node.position.x === 'number' &&
      typeof node.position.y === 'number'
        ? node.position
        : { x: 120 + (index % 4) * 220, y: 100 + Math.floor(index / 4) * 160 },
  }));


const dialogStyles = {
  overlay: {
  position: 'fixed',
  inset: 0,
  zIndex: 2147483647,
  background: 'rgba(0,0,0,0.65)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto', 
},
  box: {
    background: 'linear-gradient(160deg, #111827 0%, #0d1520 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '28px 32px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  iconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: '16px',
    color: '#f1f5f9',
    letterSpacing: '-0.3px',
    margin: 0,
  },
  sub: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    color: '#64748b',
    margin: '4px 0 0',
    lineHeight: 1.6,
  },
  pipelineName: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.05)',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '9px 20px',
    borderRadius: '9px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#94a3b8',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 600,
    fontSize: '12px',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  deleteBtn: {
    padding: '9px 20px',
    borderRadius: '9px',
    border: '1px solid rgba(239,68,68,0.35)',
    background: 'linear-gradient(135deg, rgba(239,68,68,0.22), rgba(220,38,38,0.12))',
    color: '#fca5a5',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    transition: 'all 0.15s',
    boxShadow: '0 2px 8px rgba(239,68,68,0.15)',
  },
};

/* ── Delete Confirm Dialog Component ── */
function DeleteConfirmDialog({ pipelineName, onConfirm, onCancel }) {
  return (
    <div
      style={dialogStyles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div style={dialogStyles.box} onClick={(e) => e.stopPropagation()}>
        {/* Icon + text */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={dialogStyles.iconWrap}>⚠</div>
          <div>
            <p style={dialogStyles.title}>Delete Pipeline?</p>
            <p style={dialogStyles.sub}>
              You're about to delete{' '}
              <span style={dialogStyles.pipelineName}>"{pipelineName}"</span>.
              <br />This action cannot be undone.
            </p>
          </div>
        </div>

        <div style={dialogStyles.divider} />

        {/* Actions */}
        <div style={dialogStyles.actions}>
          <button
            style={dialogStyles.cancelBtn}
            onClick={onCancel}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.08)';
              e.target.style.color = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.04)';
              e.target.style.color = '#94a3b8';
            }}
          >
            Cancel
          </button>
          <button
            style={dialogStyles.deleteBtn}
            onClick={onConfirm}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(239,68,68,0.35), rgba(220,38,38,0.22))';
              e.target.style.boxShadow = '0 4px 16px rgba(239,68,68,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(239,68,68,0.22), rgba(220,38,38,0.12))';
              e.target.style.boxShadow = '0 2px 8px rgba(239,68,68,0.15)';
            }}
          >
            Delete Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}

export const PipelineToolbar = () => {
  const { clearAll, setNodes, setEdges } = useStore();
  const [savedPanelOpen, setSavedPanelOpen] = useState(false);
  const [savedPipelines, setSavedPipelines] = useState([]);
  const [loadedFeedback, setLoadedFeedback] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }
  
  const handleOpenSavedPanel = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/pipelines`);
      const data = await res.json();
      setSavedPipelines(data);
      setSavedPanelOpen(true);
    } catch (err) {
      console.error('Failed to fetch pipelines:', err);
    }
  };

  const handleLoadPipeline = (pipeline) => {
    const fixedNodes = restoreNodePositions(pipeline.nodes);
    const fixedEdges = restoreEdgeStyles(pipeline.edges);

    setTimeout(() => {
      setNodes(fixedNodes);
      setEdges(fixedEdges);
    }, 0);

    useStore.getState().setInputValues?.(pipeline.input_values || {});

    setSavedPanelOpen(false);
    setLoadedFeedback(pipeline.name);
    setTimeout(() => setLoadedFeedback(null), 2500);
  };

  /* ── opens the custom dialog ── */
  const handleDeleteClick = (id, name, e) => {
    e.stopPropagation();
    setConfirmDelete({ id, name });
  };

  /* ── confirmed: actually delete ── */
  const handleDeleteConfirmed = async () => {
    const { id } = confirmDelete;
    setConfirmDelete(null);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/pipelines/${id}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSavedPipelines((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <>
      {/* ===== SAVED PIPELINES PANEL ===== */}
      {savedPanelOpen && (
        <>
          {/* BACKDROP */}
          <div
            className="sp-backdrop"
            onClick={() => {
              setSavedPanelOpen(false);
              setConfirmDelete(null);
            }}
          />

          {/* PANEL */}
          <div className="sp-panel">
            <div className="sp-panel-header">
              <div className="sp-panel-title">Saved Pipelines</div>
              <button
                className="sp-panel-close"
                onClick={() => {
                  setSavedPanelOpen(false);
                  setConfirmDelete(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="sp-panel-body">
              {savedPipelines.length === 0 ? (
                <div className="sp-empty">
                  <div className="sp-empty-icon">◯</div>
                  <div className="sp-empty-text">No saved pipelines yet</div>
                  <div className="sp-empty-sub">
                    Execute a pipeline and save it from the Summary tab
                  </div>
                </div>
              ) : (
                <div className="sp-list">
                  {savedPipelines.map((pipeline) => {
                    const nodeLabels = (pipeline.nodes || []).map(
                      (n) => n?.data?.label || n?.id || "Node"
                    );
                    const visibleLabels = nodeLabels.slice(0, MAX_BADGES);
                    const overflow = nodeLabels.length - MAX_BADGES;

                    return (
                      <div key={pipeline.id} className="sp-item">
                        <div className="sp-item-top">
                          <div className="sp-item-info">
                            <div className="sp-item-name">{pipeline.name}</div>
                            <div className="sp-item-meta">
                              {pipeline.nodes?.length || 0} nodes ·{" "}
                              {pipeline.edges?.length || 0} edges ·{" "}
                              {pipeline.savedAt
                                ? new Date(pipeline.savedAt).toLocaleDateString()
                                : "No date"}
                            </div>
                          </div>

                          <div className="sp-item-actions">
                            <button
                              className="sp-load-btn"
                              onClick={() => handleLoadPipeline(pipeline)}
                            >
                              Load
                            </button>

                            <button
                              className="sp-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDelete({
                                  id: pipeline.id,
                                  name: pipeline.name,
                                });
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {nodeLabels.length > 0 && (
                          <div className="sp-node-badges">
                            {visibleLabels.map((label, i) => (
                              <span key={i} className="sp-node-badge">
                                {label}
                              </span>
                            ))}
                            {overflow > 0 && (
                              <span className="sp-node-badge-overflow">
                                +{overflow} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

    
          {confirmDelete && (
            <DeleteConfirmDialog
              pipelineName={confirmDelete.name}
              onConfirm={handleDeleteConfirmed}
              onCancel={() => setConfirmDelete(null)}
            />
          )}
        </>
      )}

      {/* ===== TOAST ===== */}
      {loadedFeedback && (
        <div className="sp-toast">✓ Loaded "{loadedFeedback}"</div>
      )}

      {/* ===== TOOLBAR ===== */}
      <div className="toolbar-root">
        <div className="toolbar-header">
          <div className="toolbar-title">Nodes</div>
          <div className="toolbar-main-title">Pipeline Builder</div>
        </div>

        <div className="toolbar-nodes-wrapper">
          <div className="toolbar-nodes">
            {nodeList.map((node) => (
              <DraggableNode key={node.type} type={node.type} label={node.label} />
            ))}
          </div>

          <button className="toolbar-saved-btn" onClick={handleOpenSavedPanel}>
            ☰ Saved Pipelines
          </button>
        </div>
      </div>
    </>
  );
};