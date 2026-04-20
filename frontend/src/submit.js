import { useState, useEffect } from 'react';
import { useStore } from './store';
import "./submit.css";

const formatNodeType = (type) => {
  if (!type) return 'Unknown';
  if (type === 'customInput') return 'Input';
  if (type === 'customOutput') return 'Output';
  return type.replace(/^\w/, c => c.toUpperCase());
};

export const SubmitButton = () => {
  const { nodes, edges, inputValues, setOutputs } = useStore();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [expandedLogs, setExpandedLogs] = useState({});
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setResult(null);
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const toggleLogExpand = (key) => {
    setExpandedLogs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const [saving, setSaving] = useState(false);

  const handleSavePipeline = async () => {
    if (!saveName.trim() || saving) return;

    setSaving(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/pipelines/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName.trim(),
          nodes: nodes.map((n) => ({
            ...n,
            position: {
              x: typeof n.position?.x === "number" ? n.position.x : 0,
              y: typeof n.position?.y === "number" ? n.position.y : 0,
            },
          })),
          edges,
          input_values: inputValues,
        }),
      });

      if (!res.ok) {
        throw new Error(`Save failed: ${res.status}`);
      }

      // optional: you can read response if needed
      // const data = await res.json();

      setSaveName('');
      setSaveModalOpen(false);
      setSavedFeedback(true);

      setTimeout(() => {
        setSavedFeedback(false);
      }, 2000);

    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save pipeline. Check backend.");
    } finally {
      setSaving(false);
    }
  };
  const handleSubmit = async () => {
    if (nodes.length === 0) {
      setResult({
        error: "No nodes found — add at least one node"
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setExpandedLogs({});
    setActiveTab('summary');

    const executionStart = performance.now();
    const logs = {
      phases: [],
      dagAnalysis: null,
      executionData: null,
      timing: {},
      errors: []
    };

    try {
      // 🔥 STEP 1: VALIDATE
      const parseStartTime = performance.now();
      
      logs.phases.push({
        name: 'VALIDATION',
        status: 'in-progress',
        startTime: parseStartTime,
        details: {
          nodesCount: nodes.length,
          edgesCount: edges.length,
          nodeIds: nodes.map(n => n.id),
          edges: edges.map(e => {
            const fromNode = nodes.find(n => n.id === e.source);
            const toNode = nodes.find(n => n.id === e.target);

            return `${fromNode?.data?.label || e.source} → ${toNode?.data?.label || e.target}`;
          })
        }
      });

      const parseRes = await fetch(`${process.env.REACT_APP_API_URL}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      const parseEndTime = performance.now();

      if (!parseRes.ok) throw new Error('Server error during validation');

      const parseData = await parseRes.json();

      logs.phases[0] = {
        ...logs.phases[0],
        status: parseData.is_dag ? 'success' : 'failed',
        endTime: parseEndTime,
        duration: (parseEndTime - parseStartTime).toFixed(2),
        result: parseData
      };

      logs.dagAnalysis = parseData;

      if (!parseData.is_dag) {
        logs.phases.push({
          name: 'EXECUTION',
          status: 'skipped',
          reason: 'Invalid DAG structure - cannot execute',
          errors: parseData.errors
        });

        setResult({
          ...parseData,
          logs,
          execution: null,
          totalTime: (performance.now() - executionStart).toFixed(2)
        });
        
        setLoading(false);
        return;
      }

      // 🔥 STEP 2: EXECUTION
      const execStartTime = performance.now();

      logs.phases.push({
        name: 'EXECUTION',
        status: 'in-progress',
        startTime: execStartTime,
        nodeSteps: []
      });

      const execRes = await fetch(`${process.env.REACT_APP_API_URL}/pipelines/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          input_values: inputValues,
        }),
      });

      const execEndTime = performance.now();

      if (!execRes.ok) throw new Error('Execution failed on server');

      const execData = await execRes.json();

      if (execData.error) {
        logs.errors.push({
          phase: 'EXECUTION',
          message: execData.error,
          severity: 'critical'
        });
        throw new Error(execData.error);
      }

      const nodeExecutionLog = buildNodeExecutionLog(
        nodes,
        edges,
        inputValues,
        execData.outputs,
        parseData
      );

      logs.phases[1] = {
        ...logs.phases[1],
        status: 'success',
        endTime: execEndTime,
        duration: (execEndTime - execStartTime).toFixed(2),
        nodeSteps: nodeExecutionLog,
        outputs: execData.outputs
      };

      logs.timing = {
        validationPhase: (parseEndTime - parseStartTime).toFixed(2),
        executionPhase: (execEndTime - execStartTime).toFixed(2),
        totalTime: (execEndTime - executionStart).toFixed(2)
      };

      if (execData.outputs) {
        setOutputs(execData.outputs);
      }

      setResult({
        ...parseData,
        logs,
        execution: execData.outputs || {},
        totalTime: (performance.now() - executionStart).toFixed(2)
      });

    } catch (err) {
      console.error(err);
      
      logs.errors.push({
        phase: 'EXECUTION',
        message: err.message,
        severity: 'critical'
      });

      setResult({ 
        error: err.message || 'Backend connection failed. Please check the server.',
        logs,
        totalTime: (performance.now() - executionStart).toFixed(2)
      });
    } finally {
      setLoading(false);
    }
  };

  const buildNodeExecutionLog = (nodes, edges, inputValues, outputs, dagAnalysis) => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const executionOrder = getExecutionOrder(nodes, edges);
    
    return executionOrder.map((nodeId, index) => {
      const node = nodeMap.get(nodeId);
      const output = outputs[nodeId];
      
      const incomingEdges = edges.filter(e => e.target === nodeId);
      const outgoingEdges = edges.filter(e => e.source === nodeId);

      return {
        stepNumber: index + 1,
        nodeId: nodeId,
        nodeType: node?.data?.type || node?.type || 'unknown',
        nodeData: node?.data || {},
        input: inputValues[nodeId] || (incomingEdges.length > 0 ? 'from upstream' : 'none'),
        incomingConnections: incomingEdges.map(e => ({
          from: e.source,
          fromType: nodeMap.get(e.source)?.data?.type || nodeMap.get(e.source)?.type,
          handle: e.sourceHandle || 'default'
        })),
        outgoingConnections: outgoingEdges.map(e => ({
          to: e.target,
          toType: nodeMap.get(e.target)?.data?.type || nodeMap.get(e.target)?.type,
          handle: e.targetHandle || 'default'
        })),
        output: output,
        outputType: typeof output,
        status: output !== undefined && output !== null ? 'success' : 'no-output'
      };
    });
  };

  const getExecutionOrder = (nodes, edges) => {
    const graph = new Map();
    const indegree = new Map();

    nodes.forEach(n => {
      graph.set(n.id, []);
      indegree.set(n.id, 0);
    });

    edges.forEach(e => {
      graph.get(e.source).push(e.target);
      indegree.set(e.target, (indegree.get(e.target) || 0) + 1);
    });

    const queue = nodes.filter(n => indegree.get(n.id) === 0).map(n => n.id);
    const order = [];

    while (queue.length > 0) {
      const node = queue.shift();
      order.push(node);

      graph.get(node).forEach(neighbor => {
        indegree.set(neighbor, indegree.get(neighbor) - 1);
        if (indegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      });
    }

    return order;
  };

  const close = () => setResult(null);

  // ===== TAB RENDERERS =====

  const renderSummaryTab = () => {
    if (!result) return null;

    return (
      <div className="sb-tab-content">
        <div className="sb-summary-grid">
          <div className="sb-summary-card">
            <div className="sb-summary-label">Total Time</div>
            <div className="sb-summary-value">{result.totalTime}ms</div>
          </div>
          <div className="sb-summary-card">
            <div className="sb-summary-label">Nodes</div>
            <div className="sb-summary-value">{result.num_nodes}</div>
          </div>
          <div className="sb-summary-card">
            <div className="sb-summary-label">Edges</div>
            <div className="sb-summary-value">{result.num_edges}</div>
          </div>
          <div className="sb-summary-card">
            <div className="sb-summary-label">Status</div>
            <div className={`sb-summary-status ${result.is_dag ? 'valid' : 'invalid'}`}>
              {result.is_dag ? '✓ Valid' : '✗ Invalid'}
            </div>
          </div>
        </div>

        {result.logs?.timing && (
          <div className="sb-timing-section">
            <div className="sb-section-title">Timing Breakdown</div>
            <div className="sb-timing-bars">
              <div className="sb-timing-bar-item">
                <div className="sb-timing-bar-label">Validation</div>
                <div className="sb-timing-bar-container">
                  <div 
                    className="sb-timing-bar-fill validation"
                    style={{ width: `${(result.logs.timing.validationPhase / result.totalTime) * 100}%` }}
                  />
                </div>
                <div className="sb-timing-bar-value">{result.logs.timing.validationPhase}ms</div>
              </div>
              <div className="sb-timing-bar-item">
                <div className="sb-timing-bar-label">Execution</div>
                <div className="sb-timing-bar-container">
                  <div 
                    className="sb-timing-bar-fill execution"
                    style={{ width: `${(result.logs.timing.executionPhase / result.totalTime) * 100}%` }}
                  />
                </div>
                <div className="sb-timing-bar-value">{result.logs.timing.executionPhase}ms</div>
              </div>
            </div>
          </div>
        )}

        <div className={`sb-dag-status-box ${result.is_dag ? 'success' : 'error'}`}>
          <span className="sb-dag-status-icon">{result.is_dag ? '✓' : '✗'}</span>
          <div className="sb-dag-status-text">
            <div className="sb-dag-status-title">
              {result.is_dag ? 'Valid DAG' : 'Invalid DAG'}
            </div>
            <div className="sb-dag-status-desc">
              {result.is_dag 
                ? 'Pipeline is acyclic and ready.'
                : `Found ${result.errors?.length || 0} issue(s).`}
            </div>
          </div>
        </div>

        {result.errors?.length > 0 && (
          <div className="sb-errors-list">
            <div className="sb-section-title">Validation Issues</div>
            {result.errors.map((err, i) => (
              <div key={i} className="sb-error-item">
                <span className="sb-error-icon">⚠</span>
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* ===== SAVE PIPELINE BUTTON ===== */}
        <div className="sb-save-section">
          {savedFeedback ? (
            <div className="sb-save-feedback">✓ Pipeline saved successfully</div>
          ) : saveModalOpen ? (
            <div className="sb-save-inline">
              <input
                className="sb-save-input"
                type="text"
                placeholder="Enter pipeline name..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSavePipeline();
                  if (e.key === 'Escape') setSaveModalOpen(false);
                }}
                autoFocus
              />
              <div className="sb-save-inline-actions">
                <button
                  className="sb-save-confirm-btn"
                  onClick={handleSavePipeline}
                  disabled={!saveName.trim() || saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  className="sb-save-cancel-btn"
                  onClick={() => { setSaveModalOpen(false); setSaveName(''); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="sb-save-pipeline-btn"
              onClick={() => setSaveModalOpen(true)}
            >
              ⬇ Save Pipeline
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderPhasesTab = () => {
    if (!result?.logs?.phases) return null;

    return (
      <div className="sb-tab-content">
        <div className="sb-phases-list">
          {result.logs.phases.map((phase, idx) => (
            <div key={idx} className={`sb-phase-item ${phase.status}`}>
              <div 
                className="sb-phase-item-header"
                onClick={() => toggleLogExpand(`phase-${idx}`)}
              >
                <div className="sb-phase-item-left">
                  <span className="sb-phase-status-icon">
                    {phase.status === 'success' && '✓'}
                    {phase.status === 'failed' && '✗'}
                    {phase.status === 'in-progress' && '⟳'}
                    {phase.status === 'skipped' && '⊘'}
                  </span>
                  <span className="sb-phase-item-name">{phase.name}</span>
                </div>
                <div className="sb-phase-item-right">
                  {phase.duration && <span className="sb-phase-item-time">{phase.duration}ms</span>}
                  <span className={`sb-phase-chevron ${expandedLogs[`phase-${idx}`] ? 'expanded' : ''}`}>▸</span>
                </div>
              </div>

              {expandedLogs[`phase-${idx}`] && (
                <div className="sb-phase-item-content">
                  {phase.details && (
                    <>
                      <div className="sb-phase-section">
                        <div className="sb-phase-section-label">Structure</div>
                        <div className="sb-phase-detail-grid">
                          <div className="sb-phase-detail">
                            <span className="sb-phase-detail-key">Nodes</span>
                            <span className="sb-phase-detail-val">{phase.details.nodesCount}</span>
                          </div>
                          <div className="sb-phase-detail">
                            <span className="sb-phase-detail-key">Edges</span>
                            <span className="sb-phase-detail-val">{phase.details.edgesCount}</span>
                          </div>
                        </div>
                      </div>

                      {phase.details.nodeIds && phase.details.nodeIds.length > 0 && (
                        <div className="sb-phase-section">
                          <div className="sb-phase-section-label">Nodes</div>
                          <div className="sb-node-list">
                            {phase.details.nodeIds.map((id, i) => {
                              const node = nodes.find(n => n.id === id);

                              return (
                                <div key={i} className="sb-node-list-item">
                                  {node?.data?.label || id}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {phase.details.edges && phase.details.edges.length > 0 && (
                        <div className="sb-phase-section">
                          <div className="sb-phase-section-label">Connections</div>
                          <div className="sb-edge-list">
                            {phase.details.edges.map((edge, i) => (
                              <div key={i} className="sb-edge-list-item">{edge}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {phase.result?.is_dag !== undefined && (
                        <div className={`sb-phase-result-badge ${phase.result.is_dag ? 'valid' : 'invalid'}`}>
                          {phase.result.is_dag ? '✓ Valid DAG' : '✗ Invalid DAG'}
                        </div>
                      )}
                    </>
                  )}

                  {phase.errors && phase.errors.length > 0 && (
                    <div className="sb-phase-errors">
                      <div className="sb-phase-section-label">Errors</div>
                      {phase.errors.map((err, i) => (
                        <div key={i} className="sb-phase-error-item">{err}</div>
                      ))}
                    </div>
                  )}

                  {phase.reason && (
                    <div className="sb-phase-reason">{phase.reason}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStepsTab = () => {
    const nodeSteps = result?.logs?.phases?.[1]?.nodeSteps;
    if (!nodeSteps || nodeSteps.length === 0) {
      return (
        <div className="sb-tab-content">
          <div className="sb-empty-state">

            {result?.is_dag === false ? (
              <div className="sb-error-card">
                <div className="sb-error-header">
                  <div className="sb-error-icon">⚠</div>
                  <div className="sb-error-content">
                    <div className="sb-error-title">Validation Failed</div>
                    <div className="sb-error-sub">
                      {result.errors?.length || 0} issue(s) detected in pipeline
                    </div>
                  </div>
                </div>

                {result.cycles && result.cycles.length > 0 && (
                  <div className="sb-cycle-section">
                    <div className="sb-cycle-title">
                      {result.cycles.length > 1 ? "Cycles Detected" : "Cycle Detected"}
                    </div>

                    {result.cycles.map((cycle, i) => (
                      <div key={i} className="sb-cycle-pill">
                        {cycle.join(" → ")}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="sb-empty-text">
                No execution steps available
              </div>
            )}

          </div>
        </div>
      );
    }
    return (
      <div className="sb-tab-content">
        <div className="sb-steps-list">
          {nodeSteps.map((step, idx) => (
            <div key={idx} className={`sb-step-item ${step.status}`}>
              <div 
                className="sb-step-item-header"
                onClick={() => toggleLogExpand(`step-${idx}`)}
              >
                <div className="sb-step-item-left">
                  <span className="sb-step-number">{step.stepNumber}</span>
                  {(() => {
                    const node = nodes.find(n => n.id === step.nodeId);

                    return (
                      <>
                        <span className="sb-step-type-badge">
                          {formatNodeType(step.nodeType)}
                        </span>

                        <span className="sb-step-id">
                          {node?.data?.label || step.nodeId}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <div className="sb-step-item-right">
                  <span className="sb-step-status">{step.status === 'success' ? '✓' : '○'}</span>
                  <span className={`sb-step-chevron ${expandedLogs[`step-${idx}`] ? 'expanded' : ''}`}>▸</span>
                </div>
              </div>

              {expandedLogs[`step-${idx}`] && (
                <div className="sb-step-item-content">

                  {/* CONFIG */}
                  {Object.keys(step.nodeData).length > 0 && (
                    <div className="sb-step-section">
                      <div className="sb-step-section-label">Configuration</div>

                      <div className="sb-config-list">
                        {Object.entries(step.nodeData)
                          .filter(([key]) => key !== "nodeType")
                          .map(([key, val], i) => (
                            <div key={i} className="sb-config-item">
                              <span className="sb-config-key">{key}</span>

                              <span className="sb-config-val">
                                {key === "id"
                                  ? nodes.find(n => n.id === val)?.data?.label || val
                                  : String(val)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* INPUTS */}
                  {step.incomingConnections.length > 0 && (
                    <div className="sb-step-section">
                      <div className="sb-step-section-label">Inputs</div>
                      <div className="sb-connections-list">
                        {step.incomingConnections.map((conn, i) => {
                          const fromNode = nodes.find(n => n.id === conn.from);

                          return (
                            <div key={i} className="sb-connection-item incoming">
                              <span className="sb-conn-from">
                                {fromNode?.data?.label || conn.from}
                              </span>
                              <span className="sb-conn-type">
                                ({formatNodeType(conn.fromType)})
                              </span>
                              <span className="sb-conn-handle">{conn.handle}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* OUTPUTS */}
                  {step.outgoingConnections.length > 0 && (
                    <div className="sb-step-section">
                      <div className="sb-step-section-label">Outputs</div>
                      <div className="sb-connections-list">
                        {step.outgoingConnections.map((conn, i) => {
                          const fromNode = nodes.find(n => n.id === step.nodeId);
                          const toNode = nodes.find(n => n.id === conn.to);

                          return (
                            <div key={i} className="sb-connection-item outgoing">
                              <span className="sb-conn-from">
                                {fromNode?.data?.label || step.nodeId}
                              </span>

                              <span className="sb-conn-arrow"> → </span>

                              <span className="sb-conn-to">
                                {toNode?.data?.label || conn.to}
                              </span>

                              <span className="sb-conn-type">
                                ({formatNodeType(conn.toType)})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* OUTPUT VALUE */}
                  <div className="sb-step-section">
                    <div className="sb-step-section-label">
                      {step.nodeType === "input" ? "Input Value" : "Output Value"}
                    </div>
                    <div className="sb-output-display">
                      {step.output !== undefined && step.output !== null ? (
                        <>
                          <span className="sb-output-type">[{step.outputType}]</span>
                          <span className="sb-output-val">
                            {typeof step.output === "object" && step.output !== null
                              ? (step.output.result !== undefined
                                  ? String(step.output.result)
                                  : JSON.stringify(step.output))
                              : String(step.output)}
                          </span>
                        </>
                      ) : (
                        <span className="sb-output-empty">No output</span>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOutputTab = () => {
    const hasRealOutput = result?.execution &&
      Object.values(result.execution).some(v => v !== null && v !== undefined);

    const hasAnyExecution =
      result?.execution && Object.keys(result.execution).length > 0;

    if (!hasAnyExecution) {
      return (
        <div className="sb-tab-content">
          <div className="sb-empty-state">
            <span className="sb-empty-icon">◯</span>
            <div className="sb-empty-text">No outputs generated</div>
          </div>
        </div>
      );
    }

    return (
      <div className="sb-tab-content">
        <div className="sb-outputs-grid">
          {Object.entries(result.execution).map(([key, val]) => {
            const node = nodes.find(n => n.id === key);

            return (
              <div key={key} className="sb-output-card">
                <div className="sb-output-card-id">
                  {node?.data?.label || key}
                </div>

                <div className="sb-output-card-value">
                  {(() => {
                    if (node?.data?.type === "delay") {
                      const sec = node?.data?.seconds ?? 1;
                      return `${sec}s`;
                    }

                    return typeof val === "object" && val !== null
                      ? (val.result !== undefined ? String(val.result) : JSON.stringify(val))
                      : String(val);
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: '📊' },
    { id: 'phases', label: 'Phases', icon: '⚙' },
    { id: 'steps', label: 'Steps', icon: '🔗' },
    { id: 'output', label: 'Output', icon: '📤' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return renderSummaryTab();
      case 'phases':
        return renderPhasesTab();
      case 'steps':
        return renderStepsTab();
      case 'output':
        return renderOutputTab();
      default:
        return null;
    }
  };

  return (
    <>
      {result && (
        <>
          <div className="sb-backdrop" onClick={close} />

          <div className="sb-modal-wrapper">
            <div className="sb-modal">
              {result.error ? (
                <div className="sb-error-modal">
                  <div className="sb-error-modal-icon">⚠</div>
                  <div className="sb-error-modal-title">Execution Failed</div>
                  <div className="sb-error-modal-message">{result.error}</div>
                  <button className="sb-error-modal-btn" onClick={close}>Close</button>
                </div>
              ) : (
                <>
                  <div className="sb-modal-header">
                    <div className="sb-modal-title">Pipeline Report</div>
                    <button className="sb-modal-close" onClick={close}>✕</button>
                  </div>

                  <div className="sb-tabs-container">
                    <div className="sb-tabs-bar">
                      {tabs.map(tab => (
                        <button
                          key={tab.id}
                          className={`sb-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                          onClick={() => setActiveTab(tab.id)}
                        >
                          <span className="sb-tab-icon">{tab.icon}</span>
                          <span className="sb-tab-label">{tab.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="sb-tab-content-wrapper">
                      {renderTabContent()}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <div className="sb-button-wrapper">
        <button
          className="sb-submit-btn"
          onClick={handleSubmit}
          disabled={loading || nodes.length === 0}
        >
          {loading && <span className="sb-spinner" />}
          {loading ? 'Executing...' : 'Execute Pipeline'}
        </button>
      </div>
    </>
  );
};