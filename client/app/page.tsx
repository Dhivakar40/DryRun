"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Toaster, toast } from "sonner"; // IMPORT TOAST
import TerminalWindow from "../components/TerminalWindow";
import EditorWindow from "../components/EditorWindow";
import ChatInterface from "../components/ChatInterface";
import StoryCard from "../components/StoryCard";
import ReportModal from "../components/ReportModal"; 
import { FileCode, Activity, Trophy } from "lucide-react"; 

const socket = io("http://localhost:4000");

export default function Home() {
  const [activeChat, setActiveChat] = useState("alex");
  const [messages, setMessages] = useState<any[]>([]);
  const [files, setFiles] = useState<any>({});
  const [activeFile, setActiveFile] = useState("main.py");
  const [unreadCounts, setUnreadCounts] = useState<any>({ alex: 0, team: 0, tanvi: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  
  // REPORT STATE
  const [reportData, setReportData] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    socket.on("chat:message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      
      // NOTIFICATION LOGIC
      if (msg.chatID !== activeChat && msg.sender !== "Me") {
        setUnreadCounts((prev: any) => ({ ...prev, [msg.chatID]: prev[msg.chatID] + 1 }));
        
        // Urgent Toast for Alex, Normal for others
        if (msg.chatID === "alex") {
            toast.error(`New Message from ${msg.sender}`, {
                description: msg.text,
                duration: 5000,
                action: {
                    label: "REPLY",
                    onClick: () => setActiveChat("alex")
                }
            });
        } else {
            toast.message(`New Message from ${msg.sender}`, {
                description: msg.text,
                action: {
                    label: "VIEW",
                    onClick: () => setActiveChat(msg.chatID)
                }
            });
        }
      }
    });

    socket.on("files:load", (loadedFiles) => {
      setFiles(loadedFiles);
      if (Object.keys(loadedFiles).length > 0 && !loadedFiles[activeFile]) {
          setActiveFile(Object.keys(loadedFiles)[0]);
      }
    });

    socket.on("report:generating", () => setIsGeneratingReport(true));

    socket.on("scenario:status", (data) => {
      if (data.status === "passed") {
         setReportData({ report: data.report, stats: data.stats });
         setIsGeneratingReport(false);
         setIsReportOpen(true);
      }
    });

    return () => {
      socket.off("chat:message");
      socket.off("files:load");
      socket.off("scenario:status");
      socket.off("report:generating");
    };
  }, [activeChat, activeFile]);

  const handleStart = () => {
    setGameStarted(true);
    socket.emit("game:start");
  };

  const handleFileChange = (newContent: string) => {
    setFiles((prev: any) => ({ ...prev, [activeFile]: newContent }));
    socket.emit("file:update", { filename: activeFile, content: newContent });
  };

  useEffect(() => {
    setUnreadCounts((prev: any) => ({ ...prev, [activeChat]: 0 }));
  }, [activeChat]);

  return (
    <main className="flex h-screen bg-[#1e1e1e] text-white overflow-hidden font-sans">
      {/* TOASTER COMPONENT (Handles the popups) */}
      <Toaster position="top-right" theme="dark" richColors />

      {!gameStarted && <StoryCard onStart={handleStart} />}
      
      {isReportOpen && reportData && (
          <ReportModal data={reportData} onClose={() => setIsReportOpen(false)} />
      )}

      {/* LEFT: CODE EDITOR AREA */}
      <div className="w-[60%] flex flex-col border-r border-[#333]">
        
        {/* HEADER WITH TABS */}
        <div className="h-10 bg-[#252526] flex items-end px-2 gap-1 border-b border-[#1e1e1e] select-none">
           {Object.keys(files).map((filename) => (
             <button
               key={filename}
               onClick={() => setActiveFile(filename)}
               className={`
                 relative flex items-center gap-2 px-4 py-2 text-xs font-medium border-t-2 transition-all rounded-t-sm
                 ${activeFile === filename 
                    ? "bg-[#1e1e1e] text-white border-blue-500 z-10" 
                    : "bg-[#2d2d2d] text-gray-400 border-transparent hover:bg-[#333] hover:text-gray-200"
                 }
               `}
             >
                <FileCode size={14} className={activeFile === filename ? "text-blue-400" : "text-gray-500"} />
                {filename}
             </button>
           ))}

           {/* ACTIONS */}
           <div className="ml-auto flex items-center gap-3 pb-1.5 pr-2">
               {isGeneratingReport && (
                   <span className="flex items-center gap-2 text-xs text-blue-400 animate-pulse font-mono">
                       <Activity size={12} /> Analyzing Performance...
                   </span>
               )}

               {reportData && (
                   <button 
                     onClick={() => setIsReportOpen(true)}
                     className="flex items-center gap-2 px-3 py-1 bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/40 border border-yellow-600/50 rounded text-[10px] font-bold transition-all animate-in fade-in"
                   >
                       <Trophy size={12} />
                       VIEW REPORT
                   </button>
               )}
           </div>
        </div>
        
        {/* EDITOR */}
        <div className="flex-1 relative">
           <EditorWindow 
             code={files[activeFile] || ""} 
             onChange={handleFileChange} 
             filename={activeFile}
           />
        </div>
        
        {/* TERMINAL */}
        <div className="h-[35%] border-t border-[#333] bg-[#1e1e1e]">
           <TerminalWindow socket={socket} />
        </div>
      </div>

      {/* RIGHT: CHAT */}
      <div className="w-[40%] flex flex-col bg-[#252526]">
        <ChatInterface 
           socket={socket} 
           activeChat={activeChat} 
           setActiveChat={setActiveChat} 
           messages={messages}
           unreadCounts={unreadCounts}
        />
      </div>
    </main>
  );
}