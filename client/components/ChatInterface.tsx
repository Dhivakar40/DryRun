"use client";
import { useState, useRef, useEffect } from "react";
import { Send, User, Users, Megaphone, Sparkles } from "lucide-react";

interface ChatInterfaceProps {
  socket: any;
  activeChat: string;
  setActiveChat: (id: string) => void;
  messages: any[];
  unreadCounts: any;
}

export default function ChatInterface({ socket, activeChat, setActiveChat, messages, unreadCounts }: ChatInterfaceProps) {
  const [inputText, setInputText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  const handleSend = (e?: any, overrideText?: string) => {
    e?.preventDefault();
    const textToSend = overrideText || inputText;
    
    if (!textToSend.trim()) return;

    const msg = {
      text: textToSend,
      chatID: activeChat,
    };

    socket.emit("chat:send", msg);
    setInputText("");
  };

  // Filter messages for current view
  const currentMessages = messages.filter((m) => m.chatID === activeChat);

  // --- SUGGESTION LOGIC ---
  const getSuggestions = () => {
    if (currentMessages.length === 0) return [];
    const lastMsg = currentMessages[currentMessages.length - 1];

    // Don't show suggestions if I just replied
    if (lastMsg.sender === "Me") return [];

    // 1. MIKE (Team Chat)
    if (activeChat === "team" && lastMsg.sender.includes("Mike")) {
        return [{ label: "Happy Journey sir! ✈️", value: "Happy Journey sir! ✈️" }];
    }

    // 2. TANVI (Marketing Chat) - CRITICAL FOR GAMEPLAY
    if (activeChat === "tanvi" && lastMsg.sender.includes("Tanvi")) {
        return [
            { label: "Sure, send it over.", value: "ACCEPT_DISTRACTION", style: "bg-green-500/20 text-green-300 border-green-500/50 hover:bg-green-500/40" },
            { label: "Can't now, strict deadline.", value: "DECLINE_DISTRACTION", style: "bg-green-500/20 text-green-300 border-green-500/50 hover:bg-green-500/40" }
        ];
    }

    return [];
  };

  const suggestions = getSuggestions();

  // Sidebar Component
  const SidebarIcon = ({ id, label, icon: Icon, bgClass, unread }: any) => (
    <button
      onClick={() => setActiveChat(id)}
      className="relative group flex flex-col items-center gap-1 transition-transform active:scale-95"
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${bgClass} text-white ${
          activeChat === id
            ? `ring-2 ring-white ring-offset-2 ring-offset-[#252526] scale-110` 
            : "opacity-60 hover:opacity-100 hover:scale-105"
        }`}
      >
        <Icon size={18} />
      </div>
      <span className={`text-[10px] font-bold tracking-wide ${activeChat === id ? "text-white" : "text-gray-500"}`}>
        {label}
      </span>
      {unread > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border-2 border-[#252526] animate-pulse shadow-md z-10">
          {unread}
        </div>
      )}
    </button>
  );

  return (
    <div className="flex h-full bg-[#1e1e1e] border-l border-[#333]">
      
      {/* 1. SIDEBAR */}
      <div className="w-[72px] bg-[#252526] border-r border-[#333] flex flex-col items-center py-6 gap-6 select-none shadow-xl z-10">
        <SidebarIcon id="alex" label="Manager" icon={User} bgClass="bg-blue-600" unread={unreadCounts.alex} />
        <SidebarIcon id="team" label="Team" icon={Users} bgClass="bg-green-600" unread={unreadCounts.team} />
        <SidebarIcon id="tanvi" label="Mktg" icon={Megaphone} bgClass="bg-purple-600" unread={unreadCounts.tanvi} />
      </div>

      {/* 2. CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        {/* Header */}
        <div className="h-12 border-b border-[#333] flex items-center px-4 bg-[#252526] shadow-sm">
             <span className="font-bold text-sm text-gray-200 capitalize flex items-center gap-2">
                {activeChat === "alex" && <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"/>}
                {activeChat === "team" && <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"/>}
                {activeChat === "tanvi" && <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"/>}
                {activeChat === "alex" ? "Alex (Manager)" : activeChat === "tanvi" ? "Tanvi (Marketing)" : "Team Channel"}
             </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#333]">
          {currentMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2 opacity-40">
              <div className="w-12 h-12 rounded-full bg-[#2d2d2d] flex items-center justify-center">
                 <Send size={20}/>
              </div>
              <span className="text-xs font-mono">Channel Empty</span>
            </div>
          )}

          {currentMessages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === "Me" ? "items-end" : "items-start"} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className="flex items-baseline gap-2 mb-1 opacity-80">
                <span className={`text-[11px] font-bold tracking-tight ${
                    msg.sender === "Me" ? "text-blue-400" : 
                    activeChat === "alex" ? "text-blue-300" :
                    activeChat === "team" ? "text-green-400" : "text-purple-400"
                }`}>
                  {msg.sender}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">{msg.timestamp}</span>
              </div>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                  msg.sender === "Me" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-[#2d2d2d] text-gray-200 border border-[#3a3a3a] rounded-tl-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* 3. INPUT AREA & SUGGESTIONS */}
        <div className="bg-[#252526] border-t border-[#333] p-3">
          
          {/* SUGGESTION CHIPS */}
          {suggestions.length > 0 && (
             <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {suggestions.map((s, i) => (
                    <button
                       key={i}
                       onClick={(e) => handleSend(e, s.value)}
                       className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all animate-in zoom-in-50 duration-200 ${
                           s.style || "bg-[#333] text-gray-300 border-[#444] hover:bg-[#444] hover:text-white"
                       }`}
                    >
                        <Sparkles size={10} className="opacity-70"/>
                        {s.label}
                    </button>
                ))}
             </div>
          )}

          <form onSubmit={(e) => handleSend(e)} className="relative group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeChat}...`}
              className="w-full bg-[#1e1e1e] text-gray-200 text-sm rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-[#333] group-hover:border-[#444] transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}