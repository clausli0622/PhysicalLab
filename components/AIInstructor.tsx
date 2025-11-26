import React, { useState } from 'react';
import { analyzeExperiment, askGeneralPhysicsQuestion } from '../services/geminiService';
import { SimulationConfig, SimulationStats } from '../types';
import ReactMarkdown from 'react-markdown';

interface AIInstructorProps {
  config: SimulationConfig;
  stats: SimulationStats;
}

const AIInstructor: React.FC<AIInstructorProps> = ({ config, stats }) => {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyze' | 'ask'>('analyze');
  const [customQuestion, setCustomQuestion] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeExperiment(config, stats);
    setResponse(result);
    setLoading(false);
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    setLoading(true);
    const result = await askGeneralPhysicsQuestion(customQuestion);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <h2 className="text-lg font-bold text-zinc-100">AI Lab Assistant</h2>
        </div>
        <div className="flex bg-zinc-800 rounded-lg p-1">
            <button 
                onClick={() => { setActiveTab('analyze'); setResponse(null); }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'analyze' ? 'bg-zinc-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
                Analyze
            </button>
            <button 
                onClick={() => { setActiveTab('ask'); setResponse(null); }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'ask' ? 'bg-zinc-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
                Ask Q&A
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {activeTab === 'analyze' && (
             <div className="space-y-4">
                <p className="text-sm text-zinc-400">
                    Click below to have the AI analyze your current experiment setup. It will check if your measured values match theoretical predictions for the current gravity.
                </p>
                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            ✨ Verify Experiment
                        </>
                    )}
                </button>
             </div>
        )}

        {activeTab === 'ask' && (
            <form onSubmit={handleAsk} className="space-y-4">
                <p className="text-sm text-zinc-400">Ask any physics question related to pendulums, gravity, or mechanics.</p>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="e.g. Why doesn't mass affect the period?"
                        className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                    <button 
                        type="submit"
                        disabled={loading || !customQuestion}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </form>
        )}

        {/* Response Area */}
        {response && (
            <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-400 text-lg">🤖</span>
                    <span className="text-xs font-bold text-zinc-500 uppercase">Newton says:</span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-zinc-300">
                    <ReactMarkdown>{response}</ReactMarkdown>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AIInstructor;