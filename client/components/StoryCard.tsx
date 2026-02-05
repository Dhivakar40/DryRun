export default function StoryCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* HEADER: STATUS BAR */}
        <div className="bg-zinc-900/50 border-b border-zinc-800 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                <span className="text-red-400 font-mono text-xs font-bold tracking-widest uppercase">
                    Critical Incident #882
                </span>
            </div>
            <div className="text-zinc-500 font-mono text-xs">
                T-MINUS: 00:00:00
            </div>
        </div>

        <div className="p-8 md:p-10">
            {/* TITLE SECTION */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
                    Payroll Service Failure
                </h1>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl">
                    It is <span className="text-white font-bold">9:55 AM on Payday</span>. The batch processing job has crashed. 
                    Thousands of employee transactions are failing with <code className="bg-zinc-800 px-1 py-0.5 rounded text-red-300 text-xs">500 Internal Server Error</code>.
                    <br/><br/>
                    Your Senior Developer is on a flight to Bali (Offline). The CTO is watching the dashboard. 
                    You are the only engineer online.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                
                {/* LEFT: OBJECTIVES */}
                <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Mission Objectives</h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <div className="mt-1 w-4 h-4 rounded border border-zinc-700 flex items-center justify-center bg-zinc-900">
                                <div className="w-2 h-2 bg-transparent"></div>
                            </div>
                            <span className="text-sm text-zinc-300">Identify & Fix the <span className="text-white">Python Logic Bug</span></span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-1 w-4 h-4 rounded border border-zinc-700 flex items-center justify-center bg-zinc-900">
                                <div className="w-2 h-2 bg-transparent"></div>
                            </div>
                            <span className="text-sm text-zinc-300">Manage <span className="text-white">Stakeholder Anxiety</span> (Alex)</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-1 w-4 h-4 rounded border border-zinc-700 flex items-center justify-center bg-zinc-900">
                                <div className="w-2 h-2 bg-transparent"></div>
                            </div>
                            <span className="text-sm text-zinc-300">Prioritize tasks & <span className="text-white">Ignore Noise</span></span>
                        </li>
                    </ul>
                </div>

                {/* RIGHT: PERSONNEL FILES */}
                <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Key Personnel</h3>
                    <div className="space-y-3">
                        {/* MIKE */}
                        <div className="flex items-center gap-3 p-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
                            <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">M</div>
                            <div className="flex-1">
                                <div className="text-xs font-bold text-zinc-300">Mike (Senior Dev)</div>
                                <div className="text-[10px] text-zinc-600">Status: <span className="text-zinc-500">OFFLINE</span></div>
                            </div>
                        </div>

                        {/* ALEX */}
                        <div className="flex items-center gap-3 p-2 rounded-lg border border-red-900/20 bg-red-900/5">
                            <div className="w-8 h-8 rounded bg-red-900/30 flex items-center justify-center text-xs font-bold text-red-400">A</div>
                            <div className="flex-1">
                                <div className="text-xs font-bold text-zinc-200">Alex (Manager)</div>
                                <div className="text-[10px] text-zinc-600">Status: <span className="text-red-400 animate-pulse">PANICKING</span></div>
                            </div>
                        </div>

                         {/* TANVI */}
                         <div className="flex items-center gap-3 p-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
                            <div className="w-8 h-8 rounded bg-purple-900/30 flex items-center justify-center text-xs font-bold text-purple-400">T</div>
                            <div className="flex-1">
                                <div className="text-xs font-bold text-zinc-300">Tanvi (Marketing)</div>
                                <div className="text-[10px] text-zinc-600">Status: <span className="text-emerald-500">ONLINE</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* FOOTER: ACTION */}
        <div className="bg-zinc-900 border-t border-zinc-800 p-6 flex justify-end">
            <button 
                onClick={onStart}
                className="group relative px-6 py-3 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded transition-all flex items-center gap-2 overflow-hidden"
            >
                <span className="relative z-10">INITIALIZE ENVIRONMENT</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
            </button>
        </div>

      </div>
    </div>
  );
}