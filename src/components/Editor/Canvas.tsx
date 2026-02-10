import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Flow, FlowNode, Position, NodeType } from '../../types';
import { Connection } from './Connection';
import { Plus, Layout } from '../Icons';

interface CanvasProps {
  flow: Flow;
  selectedNodeId: string | null;
  onNodeSelect: (id: string | null) => void;
  onNodeMove: (id: string, pos: Position) => void;
  onAddNode: (type: NodeType) => void;
  onAutoLayout: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  flow,
  selectedNodeId,
  onNodeSelect,
  onNodeMove,
  onAddNode,
  onAutoLayout
}) => {
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Constants for fixed canvas size to enable native scrolling
  const CANVAS_SIZE = 4000;

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = flow.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    onNodeSelect(nodeId);
    setDraggingNode(nodeId);
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingNode) {
      onNodeMove(draggingNode, {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  }, [draggingNode, dragOffset, onNodeMove]);

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={canvasRef}
      className="flex-1 relative overflow-auto canvas-grid bg-[#f9fafb] select-none"
      onMouseDown={() => onNodeSelect(null)}
    >
      <div 
        className="relative"
        style={{ width: `${CANVAS_SIZE}px`, height: `${CANVAS_SIZE}px` }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80">
          {flow.nodes.map(node => 
            node.options.map(opt => {
              const targetNode = flow.nodes.find(n => n.id === opt.targetNodeId);
              if (!targetNode && !opt.isExternalLink) return null;
              if (opt.isExternalLink) return null;
              return (
                <Connection 
                  key={opt.id}
                  start={node.position}
                  end={targetNode!.position}
                  label={opt.label}
                  isExternal={false}
                />
              );
            })
          )}
        </svg>

        {flow.nodes.map(node => {
          const isStart = node.id === flow.startNodeId;
          const isOutcome = node.options.length === 0 || node.options.every(o => o.isExternalLink && !o.targetNodeId);
          const isSelected = node.id === selectedNodeId;
          
          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              className={`absolute w-[220px] bg-white rounded-lg shadow-xl border-2 cursor-move flex flex-col overflow-hidden transition-all duration-150 ${
                isSelected ? 'ring-4 ring-blue-500/30 border-blue-600 z-50 scale-105' : 
                isStart ? 'border-yellow-400' : 'border-gray-300 hover:border-gray-400'
              } ${isOutcome ? 'border-gray-800 border-2' : ''}`}
              style={{ left: node.position.x, top: node.position.y }}
            >
              <div className={`p-2 text-[10px] font-bold uppercase tracking-wider text-white flex justify-between items-center ${
                node.type === 'decision' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}>
                <span>{node.type}</span>
                <div className="flex gap-1">
                  {isStart && <span className="bg-yellow-400 text-yellow-900 px-1 rounded shadow-sm">START</span>}
                  {isOutcome && <span className="bg-black text-white px-1 rounded shadow-sm">OUTCOME</span>}
                </div>
              </div>
              <div className="p-3 bg-white">
                <h4 className="font-bold text-sm leading-tight mb-1 line-clamp-2 text-gray-900">{node.content.title}</h4>
                <p className="text-[10px] text-gray-500 line-clamp-2 leading-normal">{node.content.bodyText}</p>
              </div>
              <div className="mt-auto border-t border-gray-100 p-2 space-y-1 bg-gray-50">
                {node.options.map(opt => (
                  <div key={opt.id} className="flex items-center gap-1.5 text-[9px] font-bold text-gray-700">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${opt.isExternalLink ? 'bg-purple-500' : 'bg-gray-400'}`} />
                    <span className="truncate">{opt.label}</span>
                  </div>
                ))}
                {node.options.length === 0 && <span className="text-[9px] text-gray-400 italic font-medium">No connections</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Toolbar */}
      <div className="fixed bottom-8 left-8 inline-flex flex-col gap-3 z-[60]">
        <div className="flex gap-2 bg-white p-2.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200">
          <button 
            onClick={() => onAddNode('decision')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <Plus size={16} /> Add Decision
          </button>
          <button 
            onClick={() => onAddNode('information')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <Plus size={16} /> Add Info
          </button>
          <div className="w-px bg-gray-200 mx-2" />
          <button 
            onClick={onAutoLayout}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 rounded-lg text-xs font-bold border-2 border-gray-200 transition-colors"
          >
            <Layout size={16} /> Auto-Layout
          </button>
        </div>
      </div>
    </div>
  );
};
