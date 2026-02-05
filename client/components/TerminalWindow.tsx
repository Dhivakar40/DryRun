"use client";
import { useEffect, useState, useRef } from "react";
import { Terminal, Play, UploadCloud } from "lucide-react";

interface TerminalProps {
  socket: any;
}

export default function TerminalWindow({ socket }: TerminalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for output from Docker
    socket.on("terminal:output", (data: string) => {
      setLogs((prev) => [...prev, data]);
    });

    return () => {
      socket.off("terminal:output");
    };
  }, [socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleRun = () => {
    setLogs((prev) => [...prev, "\n$ python3 tests.py\n"]);
    socket.emit("code:run");
  };

  const handlePush = () => {
    setLogs((prev) => [...prev, "\n$ git push origin master\n"]);
    socket.emit("code:push");
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e] text-white">
      {/* TERMINAL HEADER */}
      <div className="h-10 bg-[#252526] border-b border-[#333] flex items-center justify-between px-4 select-none">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <Terminal size={14} />
          <span>Console / Output</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
             onClick={clearLogs}
             className="text-[10px] text-gray-500 hover:text-gray-300 mr-2"
          >
             CLEAR
          </button>
          
          {/* RUN BUTTON */}
          <button 
            onClick={handleRun}
            className="flex items-center gap-2 px-3 py-1 bg-[#333] hover:bg-[#444] border border-[#555] rounded text-xs transition-all"
          >
            <Play size={12} className="text-green-400 fill-current" />
            <span>Test Run</span>
          </button>

          {/* DEPLOY BUTTON */}
          <button 
            onClick={handlePush}
            className="flex items-center gap-2 px-3 py-1 bg-blue-700 hover:bg-blue-600 border border-blue-500 rounded text-xs font-bold transition-all shadow-[0_0_10px_rgba(37,99,235,0.2)]"
          >
            <UploadCloud size={14} />
            <span>Deploy Fix</span>
          </button>
        </div>
      </div>

      {/* TERMINAL BODY */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-700">
        <div className="text-gray-500 mb-2">Microsoft Windows [Version 10.0.19045.4291]</div>
        <div className="text-gray-500 mb-4">(c) Microsoft Corporation. All rights reserved.</div>
        
        {logs.map((log, i) => (
          <span key={i} className="whitespace-pre-wrap break-words">
            {/* Simple coloring for Pass/Fail */}
            {log.includes("PASSED") ? (
                <span className="text-green-400 font-bold">{log}</span>
            ) : log.includes("FAILED") || log.includes("ERROR") ? (
                <span className="text-red-400 font-bold">{log}</span>
            ) : (
                <span className="text-gray-300">{log}</span>
            )}
          </span>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}