"use client";

interface IntroModalProps {
  onStart: () => void;
}

export default function IntroModal({ onStart }: IntroModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-500">
      <div className="bg-[#18181b] border border-red-900/50 w-[600px] shadow-2xl p-0 overflow-hidden relative">
        
        {/* Top Secret Stamp Effect */}
        <div className="absolute -right-4 -top-4 opacity-20 transform rotate-12 pointer-events-none">
            <div className="border-4 border-red-600 text-red-600 font-black text-6xl px-4 py-2 uppercase tracking-widest rounded-lg">
                CRITICAL
            </div>
        </div>

        {/* Header */}
        <div className="bg-red-950/30 border-b border-red-900/30 p-6">
            <div className="flex items-center space-x-2 text-red-500 mb-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold tracking-[0.2em]">LIVE INCIDENT DETECTED</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">The Friday Deploy</h1>
        </div>

        {/* Mission Details */}
        <div className="p-8 space-y-6">
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">SITUATION</h3>
                <p className="text-gray-300 leading-relaxed border-l-2 border-red-800 pl-4">
                    The tax calculation microservice has crashed immediately after the latest deployment. 
                    Production is down. The CTO is asking for an update.
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ERROR CODE</h3>
                    <div className="font-mono text-red-400 bg-red-950/20 p-2 rounded text-sm">500 Internal Server Error</div>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">AFFECTED USERS</h3>
                    <div className="font-mono text-white text-lg">12,403</div>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">OBJECTIVE</h3>
                <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside marker:text-blue-500">
                    <li>Identify the bug in <span className="font-mono text-yellow-500 bg-gray-800 px-1 rounded">main.py</span></li>
                    <li>Fix the logic to handle edge cases.</li>
                    <li>Verify the fix by running the test suite.</li>
                </ul>
            </div>
        </div>

        {/* Footer / Action */}
        <div className="p-6 bg-black/50 border-t border-gray-800 flex justify-end">
            <button 
                onClick={onStart}
                className="group relative px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-bold tracking-wider uppercase text-sm transition-all overflow-hidden"
            >
                <span className="relative z-10 flex items-center gap-2">
                    Initialize Terminal
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
                <div className="absolute inset-0 bg-red-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-20"></div>
            </button>
        </div>
      </div>
    </div>
  );
}