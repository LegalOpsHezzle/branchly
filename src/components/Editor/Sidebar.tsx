import React from 'react';
import { FlowNode, Option, Flow } from '../../types';
import { Trash2, Plus, RefreshCcw } from '../Icons';

interface SidebarProps {
  node: FlowNode;
  flow: Flow;
  onUpdate: (updatedNode: FlowNode) => void;
  onDelete: (nodeId: string) => void;
  onSetStart: (nodeId: string) => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ node, flow, onUpdate, onDelete, onSetStart, onClose }) => {
  const handleContentChange = (field: string, value: string) => {
    onUpdate({
      ...node,
      content: { ...node.content, [field]: value }
    });
  };

  const handleAddOption = () => {
    const newOption: Option = {
      id: `opt-${Date.now()}`,
      label: 'New Option',
      targetNodeId: null,
      isExternalLink: false
    };
    onUpdate({ ...node, options: [...node.options, newOption] });
  };

  const handleUpdateOption = (index: number, updates: Partial<Option>) => {
    const newOptions = [...node.options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onUpdate({ ...node, options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    onUpdate({
      ...node,
      options: node.options.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="w-80 h-full bg-white border-l border-gray-300 shadow-2xl flex flex-col overflow-hidden relative z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 flex justify-between items-center bg-gray-50 shrink-0">
        <div>
          <h2 className="font-bold text-gray-900 leading-tight">
            {node.type === 'decision' ? 'Decision Node' : 'Information Node'}
          </h2>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ID: {node.id.split('-').pop()}</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-900 p-2 transition-colors rounded-full hover:bg-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 scroll-smooth">
        {/* Basic Content */}
        <section className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase mb-1 tracking-wider">Node Title</label>
            <input
              type="text"
              value={node.content.title}
              onChange={(e) => handleContentChange('title', e.target.value)}
              className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm text-gray-900 font-medium focus:border-blue-500 focus:ring-0 outline-none bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase mb-1 tracking-wider">Body Text</label>
            <textarea
              value={node.content.bodyText}
              onChange={(e) => handleContentChange('bodyText', e.target.value)}
              rows={5}
              className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-0 outline-none bg-white transition-colors leading-relaxed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase mb-1 tracking-wider">Image URL (Optional)</label>
            <input
              type="text"
              value={node.content.imageUrl || ''}
              onChange={(e) => handleContentChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm text-gray-900 bg-white focus:border-blue-500 outline-none transition-colors"
            />
          </div>
        </section>

        {/* Options & Branching */}
        <section className="space-y-4">
          <div className="flex justify-between items-center pb-1 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Navigation Options</h3>
            <button
              onClick={handleAddOption}
              className="text-blue-700 hover:text-blue-900 text-[10px] font-bold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-100 transition-colors"
            >
              <Plus size={12} /> ADD OPTION
            </button>
          </div>

          <div className="space-y-4">
            {node.options.map((opt, idx) => (
              <div key={opt.id} className="p-3 border-2 border-gray-200 rounded-lg bg-white space-y-3 relative group shadow-sm">
                <button
                  onClick={() => handleRemoveOption(idx)}
                  className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-600 border border-gray-200 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Option"
                >
                  <Trash2 size={12} />
                </button>
                
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Button Label</label>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleUpdateOption(idx, { label: e.target.value })}
                    className="w-full text-sm font-bold border-b-2 border-gray-300 bg-transparent py-1 text-gray-900 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Option text..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-[11px] font-bold text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={opt.isExternalLink}
                      onChange={(e) => handleUpdateOption(idx, { isExternalLink: e.target.checked })}
                    />
                    <span>Open External Link</span>
                  </label>
                </div>

                {opt.isExternalLink ? (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">URL</label>
                    <input
                      type="text"
                      value={opt.externalUrl || ''}
                      onChange={(e) => handleUpdateOption(idx, { externalUrl: e.target.value })}
                      className="w-full text-xs border-2 border-gray-300 rounded px-2 py-1.5 text-gray-900 bg-white focus:border-blue-500 outline-none transition-colors"
                      placeholder="https://..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Go to Node</label>
                    <select
                      value={opt.targetNodeId || ''}
                      onChange={(e) => handleUpdateOption(idx, { targetNodeId: e.target.value || null })}
                      className="w-full text-xs border-2 border-gray-300 rounded px-2 py-1.5 bg-white text-gray-900 font-medium focus:border-blue-500 outline-none transition-colors"
                    >
                      <option value="">(Terminal / No Link)</option>
                      {flow.nodes.filter(n => n.id !== node.id).map(n => (
                        <option key={n.id} value={n.id}>
                          {n.content.title.substring(0, 40)}{n.content.title.length > 40 ? '...' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
            {node.options.length === 0 && (
              <p className="text-center py-4 text-xs text-gray-400 italic">No buttons configured. This is an outcome node.</p>
            )}
          </div>
        </section>

        {/* Global Node Actions */}
        <div className="pt-8 border-t border-gray-200 space-y-3">
          <button
            onClick={() => onSetStart(node.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded text-xs font-bold border-2 border-yellow-500 bg-yellow-50 text-yellow-900 hover:bg-yellow-100 transition-colors shadow-sm"
          >
            <RefreshCcw size={14} /> Set as Start Node
          </button>
          <button
            onClick={() => onDelete(node.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded text-xs font-bold border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors shadow-sm"
          >
            <Trash2 size={14} /> Delete Node
          </button>
        </div>
      </div>
    </div>
  );
};
