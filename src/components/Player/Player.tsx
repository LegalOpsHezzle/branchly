import React, { useState } from 'react';
import { Flow } from '../../types';
import { RefreshCcw, ChevronRight, ExternalLink } from '../Icons';

interface PlayerProps {
  flow: Flow;
  onExit: () => void;
}

export const Player: React.FC<PlayerProps> = ({ flow, onExit }) => {
  // Session history stack to track navigation path
  const [history, setHistory] = useState<string[]>([flow.startNodeId]);
  
  // Current node is always the last entry in the history stack
  const currentNodeId = history[history.length - 1];
  const currentNode = flow.nodes.find(n => n.id === currentNodeId) || flow.nodes[0];

  const handleOptionClick = (targetId: string | null, isExternal: boolean, url?: string) => {
    if (isExternal && url) {
      window.open(url, '_blank');
      return;
    }
    if (targetId) {
      // Append new node to history stack (forward navigation)
      setHistory(prev => [...prev, targetId]);
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      // Remove last node to return to previous state
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const restart = () => setHistory([flow.startNodeId]);

  return (
    <div className="fixed inset-0 bg-[#f3f4f6] flex flex-col z-50 overflow-y-auto">
      {/* GOV.UK Header Style */}
      <header className="bg-black text-white p-4 shrink-0 shadow-md">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">Branchly <span className="text-gray-400 font-normal">| Guidance</span></h1>
          <button 
            onClick={onExit}
            className="text-sm font-medium border border-gray-600 px-3 py-1 rounded hover:bg-gray-800"
          >
            Exit Preview
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white shadow-xl border-t-8 border-emerald-700 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              {currentNode.content.title}
            </h2>
            
            <div className="prose prose-lg max-w-none text-[#0b0c0c] leading-relaxed whitespace-pre-wrap">
              {currentNode.content.bodyText}
            </div>

            {currentNode.content.imageUrl && (
              <div className="mt-8 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <img src={currentNode.content.imageUrl} alt="Context" className="w-full h-auto object-cover max-h-96" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {currentNode.type === 'decision' ? (
              currentNode.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.targetNodeId, opt.isExternalLink, opt.externalUrl)}
                  className="w-full group text-left p-6 border-2 border-[#0b0c0c] hover:bg-[#f3f4f6] focus:bg-[#ffdd00] transition-colors flex items-center justify-between"
                >
                  <span className="text-xl font-bold">{opt.label}</span>
                  {opt.isExternalLink ? <ExternalLink size={24} /> : <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              ))
            ) : (
              <div className="space-y-4">
                {currentNode.options.length > 0 && (
                  currentNode.options.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionClick(opt.targetNodeId, opt.isExternalLink, opt.externalUrl)}
                      className="govuk-button w-full text-xl py-4 flex items-center justify-center gap-2"
                    >
                      {opt.label} <ChevronRight />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-6">
              {history.length > 1 && (
                <button 
                  onClick={handleBack}
                  className="text-[#0b0c0c] underline font-bold flex items-center gap-1 hover:no-underline"
                >
                  Back
                </button>
              )}
              <button 
                onClick={restart}
                className="text-[#0b0c0c] underline font-bold flex items-center gap-2 hover:no-underline"
              >
                <RefreshCcw size={18} /> Start again
              </button>
            </div>
            <div className="flex-1" />
            <p className="text-sm text-gray-500 italic truncate max-w-[200px]">{flow.title}</p>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-gray-400 text-xs">
        <p>&copy; 2024 Branchly. Built for Internal Compliance.</p>
      </footer>
    </div>
  );
};
