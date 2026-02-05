// client/components/CodeEditor.tsx
"use client";

import Editor from "@monaco-editor/react";

interface EditorProps {
  code: string;
  setCode: (value: string) => void;
}

export default function CodeEditor({ code, setCode }: EditorProps) {
  return (
    <Editor
      height="100%"
      defaultLanguage="python"
      theme="vs-dark"
      value={code}
      onChange={(value) => setCode(value || "")}
      options={{
        minimap: { enabled: false }, // Hide the mini-map to save space
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}