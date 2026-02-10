import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ViewMode, UIMode, Flow, FlowNode, NodeType, Position } from './types';
import { SALMON_ACT_FLOW, GIFT_REGISTER_FLOW } from './constants';
import { calculateHierarchicalLayout } from './services/layoutEngine';
import { Canvas } from './components/Editor/Canvas';
import { Sidebar } from './components/Editor/Sidebar';
import { Player } from './components/Player/Player';
import { Play, Settings, Save, ChevronRight, User, GitBranch, Plus, Edit3, Eye, Trash2 } from './components/Icons';

const STORAGE_KEY = "decisionFlowApp.flows";

const App: React.FC = () => {
  // Modes
  const [uiMode, setUiMode] = useState<UIMode>('lawyer');
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [lawyerSubView, setLawyerSubView] = useState<'dashboard' | 'editor'>('dashboard');
  
  // Data State
  const [flows, setFlows] = useState<Flow[]>([]);
  const [editingFlowId, setEditingFlowId] = useState<string>("");
  const [activePlayerFlowId, setActivePlayerFlowId] = useState<string | null>(null);
  
  // Modals State
  const [isNewFlowModalOpen, setIsNewFlowModalOpen] = useState(false);
  const [newFlowTitle, setNewFlowTitle] = useState("");
  const [newFlowDescription, setNewFlowDescription] = useState("");
  const [deletingFlowId, setDeletingFlowId] = useState<string | null>(null);

  // Persistence Tracking
  const [lastSavedJson, setLastSavedJson] = useState<string>("");
  const [saveFeedback, setSaveFeedback] = useState<boolean>(false);

  // Load flows from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Flow[];
        if (parsed.length > 0) {
          setFlows(parsed);
          setEditingFlowId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Failed to load flows", e);
      }
    }
    // Fallback to demos - auto-layout them by default
    const laidOutSalmon = { ...SALMON_ACT_FLOW, nodes: calculateHierarchicalLayout(SALMON_ACT_FLOW) };
    const laidOutGift = { ...GIFT_REGISTER_FLOW, nodes: calculateHierarchicalLayout(GIFT_REGISTER_FLOW) };
    
    setFlows([laidOutSalmon, laidOutGift]);
    setEditingFlowId(laidOutSalmon.id);
    setLastSavedJson(JSON.stringify(laidOutSalmon));
  }, []);

  const flow = useMemo(() => 
    flows.find(f => f.id === editingFlowId), 
    [flows, editingFlowId]
  );

  useEffect(() => {
    if (flow) {
      setLastSavedJson(JSON.stringify(flow));
    }
  }, [editingFlowId]);

  const isDirty = useMemo(() => 
    flow ? JSON.stringify(flow) !== lastSavedJson : false, 
    [flow, lastSavedJson]
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = flow?.nodes.find(n => n.id === selectedNodeId);

  const handleUpdateNode = useCallback((updatedNode: FlowNode) => {
    setFlows(prev => prev.map(f => f.id === editingFlowId ? {
      ...f,
      nodes: f.nodes.map(n => n.id === updatedNode.id ? updatedNode : n)
    } : f));
  }, [editingFlowId]);

  const handleMoveNode = useCallback((nodeId: string, position: Position) => {
    setFlows(prev => prev.map(f => f.id === editingFlowId ? {
      ...f,
      nodes: f.nodes.map(n => n.id === nodeId ? { ...n, position } : n)
    } : f));
  }, [editingFlowId]);

  const handleAddNode = useCallback((type: NodeType) => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
      content: {
        title: `New ${type === 'decision' ? 'Decision' : 'Info'} Node`,
        bodyText: 'Enter your logic or information here.'
      },
      options: type === 'information' ? [
        { id: `opt-${Date.now()}`, label: 'Continue', targetNodeId: null, isExternalLink: false }
      ] : []
    };
    
    setFlows(prev => prev.map(f => f.id === editingFlowId ? {
      ...f,
      nodes: [...f.nodes, newNode]
    } : f));
    setSelectedNodeId(newNode.id);
  }, [editingFlowId]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setFlows(prevFlows => prevFlows.map(f => {
      if (f.id !== editingFlowId) return f;
      
      const filteredNodes = f.nodes.filter(n => n.id !== nodeId);
      
      const cleanedNodes = filteredNodes.map(node => ({
        ...node,
        options: node.options.map(opt => ({
          ...opt,
          targetNodeId: opt.targetNodeId === nodeId ? null : opt.targetNodeId
        }))
      }));

      let newStartNodeId = f.startNodeId;
      if (f.startNodeId === nodeId) {
        newStartNodeId = cleanedNodes.length > 0 ? cleanedNodes[0].id : '';
      }

      return {
        ...f,
        nodes: cleanedNodes,
        startNodeId: newStartNodeId
      };
    }));
    setSelectedNodeId(null);
  }, [editingFlowId]);

  const handleSetStartNode = useCallback((nodeId: string) => {
    setFlows(prev => prev.map(f => f.id === editingFlowId ? { ...f, startNodeId: nodeId } : f));
  }, [editingFlowId]);

  const handleAutoLayout = useCallback(() => {
    setFlows(prev => prev.map(f => f.id === editingFlowId ? {
      ...f,
      nodes: calculateHierarchicalLayout(f)
    } : f));
  }, [editingFlowId]);

  const handleSave = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flows));
    if (flow) {
      setLastSavedJson(JSON.stringify(flow));
    }
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  }, [flows, flow]);

  const handleCreateNewFlow = () => {
    if (!newFlowTitle.trim()) return;

    const startNodeId = `node-start-${Date.now()}`;
    const newFlow: Flow = {
      id: `flow-${Date.now()}`,
      title: newFlowTitle,
      description: newFlowDescription,
      startNodeId: startNodeId,
      nodes: [
        {
          id: startNodeId,
          type: 'information',
          position: { x: 500, y: 100 },
          content: {
            title: 'Start',
            bodyText: 'Add your first question or guidance step.'
          },
          options: []
        }
      ]
    };

    const updatedFlows = [...flows, newFlow];
    setFlows(updatedFlows);
    setEditingFlowId(newFlow.id);
    setLastSavedJson(JSON.stringify(newFlow));
    setNewFlowTitle("");
    setNewFlowDescription("");
    setIsNewFlowModalOpen(false);
    setSelectedNodeId(null);
    setLawyerSubView('editor');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFlows));
  };

  const handleEditFlow = (id: string) => {
    setEditingFlowId(id);
    setLawyerSubView('editor');
    setViewMode('editor');
    setSelectedNodeId(null);
  };

  const handlePreviewFlow = (id: string) => {
    setEditingFlowId(id);
    setLawyerSubView('editor');
    setViewMode('player');
    setSelectedNodeId(null);
  };

  const handleDeleteFlow = (id: string) => {
    setFlows(prev => {
      const next = prev.filter(f => f.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    if (editingFlowId === id) {
      setEditingFlowId("");
      setLawyerSubView('dashboard');
    }
    setDeletingFlowId(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-1 rounded">
              <GitBranch size={20} />
            </div>
            <h1 className="font-bold text-sm text-gray-900 leading-tight hidden md:block">
              Branchly
            </h1>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => { setUiMode('user'); setViewMode('editor'); }}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold transition-all ${uiMode === 'user' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <User size={14} /> User View
            </button>
            <button
              onClick={() => { setUiMode('lawyer'); setLawyerSubView('dashboard'); }}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold transition-all ${uiMode === 'lawyer' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Settings size={14} /> Lawyer View
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {uiMode === 'lawyer' ? (
            <>
              {lawyerSubView === 'editor' && flow && (
                <div className="flex items-center gap-4 mr-4">
                  <button 
                    onClick={() => {
                      setLawyerSubView('dashboard');
                      setViewMode('editor');
                    }}
                    className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <ChevronRight size={14} className="rotate-180" /> Back to List
                  </button>
                  <div className="w-px h-6 bg-gray-200" />
                  <span className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{flow.title}</span>
                </div>
              )}
              {lawyerSubView === 'editor' && (
                <div className="flex items-center gap-3">
                  {isDirty && <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Unsaved changes</span>}
                  <button 
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-all border ${saveFeedback ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Save size={16} /> {saveFeedback ? 'Saved!' : 'Save changes'}
                  </button>
                  <button 
                    onClick={() => setViewMode('player')}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded text-sm font-bold hover:bg-gray-800 transition-colors"
                  >
                    <Play size={16} fill="currentColor" /> Preview Flow
                  </button>
                </div>
              )}
              {lawyerSubView === 'dashboard' && (
                <button 
                  onClick={() => setIsNewFlowModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus size={16} /> New workflow
                </button>
              )}
            </>
          ) : (
            <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              User Dashboard
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {uiMode === 'lawyer' ? (
          lawyerSubView === 'editor' && flow ? (
            <>
              <Canvas 
                flow={flow}
                selectedNodeId={selectedNodeId}
                onNodeSelect={setSelectedNodeId}
                onNodeMove={handleMoveNode}
                onAddNode={handleAddNode}
                onAutoLayout={handleAutoLayout}
              />
              {selectedNode && (
                <Sidebar 
                  node={selectedNode}
                  flow={flow}
                  onUpdate={handleUpdateNode}
                  onDelete={handleDeleteNode}
                  onSetStart={handleSetStartNode}
                  onClose={() => setSelectedNodeId(null)}
                />
              )}
              {viewMode === 'player' && (
                <Player flow={flow} onExit={() => setViewMode('editor')} />
              )}
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Workflow Management</h2>
                    <p className="text-gray-600">Create, edit, and manage your internal decision logic flows.</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  {flows.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                      <p className="text-gray-500 font-medium mb-4">No workflows found.</p>
                      <button 
                        onClick={() => setIsNewFlowModalOpen(true)}
                        className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <Plus size={16} /> Create your first workflow
                      </button>
                    </div>
                  ) : (
                    <>
                      {flows.map(f => {
                        const isDemo = f.id === SALMON_ACT_FLOW.id || f.id === GIFT_REGISTER_FLOW.id;
                        return (
                          <div key={f.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                            <div className="flex-1 mr-8">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{f.title}</h3>
                              <p className="text-gray-600 line-clamp-1">{f.description || "No description provided."}</p>
                              <div className="flex items-center gap-3 mt-3">
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded uppercase tracking-wider">
                                  {f.nodes.length} Nodes
                                </span>
                                {isDemo && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded uppercase tracking-wider">
                                    Demo
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                onClick={() => handlePreviewFlow(f.id)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 font-bold text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <Eye size={16} /> Preview
                              </button>
                              <button
                                onClick={() => handleEditFlow(f.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white font-bold text-sm rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                              >
                                <Edit3 size={16} /> Edit Flow
                              </button>
                              <button
                                onClick={() => setDeletingFlowId(f.id)}
                                disabled={isDemo}
                                title={isDemo ? "Demo workflow cannot be deleted" : "Delete workflow"}
                                className={`flex items-center justify-center p-2 rounded-lg border transition-colors ${
                                  isDemo 
                                    ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' 
                                    : 'bg-white border-gray-300 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                                }`}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <div className="mt-8 flex justify-center">
                        <button 
                          onClick={() => setIsNewFlowModalOpen(true)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <Plus size={16} /> Add a new workflow
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Guidance</h2>
              <p className="text-gray-600 mb-8">Select a tool below to begin a logic-based guidance flow.</p>
              <div className="grid gap-4">
                {flows.map(f => (
                  <div key={f.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{f.title}</h3>
                      <p className="text-gray-600 mt-1">{f.description}</p>
                    </div>
                    <button
                      onClick={() => setActivePlayerFlowId(f.id)}
                      className="govuk-button flex items-center gap-2 rounded-lg"
                    >
                      Start <ChevronRight size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {activePlayerFlowId && (
              <Player 
                flow={flows.find(f => f.id === activePlayerFlowId)!} 
                onExit={() => setActivePlayerFlowId(null)} 
              />
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingFlowId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200">
            <div className="p-6 bg-red-50 border-b border-red-100">
              <h3 className="text-lg font-bold text-red-900">Delete workflow?</h3>
            </div>
            <div className="p-6 bg-white">
              <p className="text-sm text-gray-600 leading-relaxed">
                This will permanently delete this workflow. This cannot be undone.
              </p>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setDeletingFlowId(null)}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteFlow(deletingFlowId)}
                className="px-6 py-2 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 shadow-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isNewFlowModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Create New Workflow</h3>
            </div>
            <div className="p-6 space-y-4 bg-white">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Flow Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={newFlowTitle}
                  onChange={(e) => setNewFlowTitle(e.target.value)}
                  placeholder="e.g. Gift Policy Compliance"
                  className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-0 outline-none bg-white transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Description</label>
                <textarea 
                  value={newFlowDescription}
                  onChange={(e) => setNewFlowDescription(e.target.value)}
                  placeholder="Explain what this guidance flow helps with."
                  rows={3}
                  className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-0 outline-none bg-white transition-colors"
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setIsNewFlowModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateNewFlow}
                disabled={!newFlowTitle.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                Create workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
