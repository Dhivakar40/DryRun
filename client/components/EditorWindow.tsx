"use client";
import Editor from "@monaco-editor/react";

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  filename: string;
}

export default function EditorWindow({ code, onChange, filename }: EditorProps) {
  return (
    <div className="w-full h-full bg-[#1e1e1e]">
      <Editor
        height="100%"
        width="100%"
        language="python"
        theme="vs-dark"
        path={filename} // This helps Monaco preserve state per file
        value={code}
        onChange={(value) => onChange(value || "")}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'Consolas', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
          lineNumbers: "on",
          renderLineHighlight: "all",
          contextmenu: false,
        }}
      />
    </div>
  );
}