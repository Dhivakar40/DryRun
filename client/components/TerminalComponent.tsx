"use client";
import { useEffect, useRef, useState } from "react";
// Only install xterm if you really need full interactivity. 
// For this read-only output, a simple div is much cleaner and less buggy.

export default function TerminalComponent({ socket }: { socket: any }) {
  const [logs, setLogs] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutput = (data: string) => {
      // Split by newline to render clean lines
      setLogs((prev) => [...prev, data]);
    };

    socket.on("terminal:output", handleOutput);
    return () => {
      socket.off("terminal:output", handleOutput);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="w-full h-full bg-black p-4 overflow-y-auto font-mono text-xs md:text-sm leading-snug">
      {/* HEADER */}
      <div className="text-gray-500 mb-2 select-none border-b border-gray-800 pb-1">
        admin@dryrun:~/payroll-service$
      </div>

      {/* LOG OUTPUT */}
      <div className="whitespace-pre-wrap text-green-400">
        {logs.join("")}
      </div>
      
      {/* CURSOR */}
      <div className="flex items-center mt-1">
        <span className="text-green-500 mr-2">$</span>
        <div className="w-2 h-4 bg-gray-500 animate-pulse"></div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}