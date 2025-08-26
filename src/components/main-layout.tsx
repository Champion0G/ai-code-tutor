
"use client";

import { useState, useCallback } from "react";
import type { FileNode } from "@/lib/mock-data";
import { fileTree } from "@/lib/mock-data";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { FileExplorer } from "@/components/file-explorer";
import { CodePanel } from "@/components/code-panel";
import { AiPanel } from "@/components/ai-panel";

export function MainLayout() {
  const [activeFile, setActiveFile] = useState<FileNode | null>(
    fileTree[0].children![0] as FileNode
  );
  const [selectedSnippet, setSelectedSnippet] = useState<string>("");

  const handleFileSelect = useCallback((file: FileNode) => {
    if (file.type === "file") {
      setActiveFile(file);
      setSelectedSnippet(""); // Reset snippet on new file selection
    }
  }, []);

  const handleSnippetSelect = () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      setSelectedSnippet(selection);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <FileExplorer files={fileTree} onFileSelect={handleFileSelect} activeFile={activeFile} />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              <CodePanel
                file={activeFile}
                onMouseUp={handleSnippetSelect}
              />
              <AiPanel
                fileContent={activeFile?.content || ""}
                fileName={activeFile?.name || ""}
                selectedSnippet={selectedSnippet}
                setSelectedSnippet={setSelectedSnippet}
              />
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
