
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
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

type ViewMode = 'fileTree' | 'singleFile';

export function MainLayout() {
  const [activeFile, setActiveFile] = useState<FileNode | null>(
    fileTree[0].children![0] as FileNode
  );
  const [selectedSnippet, setSelectedSnippet] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>('fileTree');

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

  const handleFileUpload = (uploadedFile: { name: string; content: string }) => {
    setActiveFile({
        type: 'file',
        name: uploadedFile.name,
        path: `/${uploadedFile.name}`,
        content: uploadedFile.content,
    });
    setSelectedSnippet("");
    setViewMode('singleFile');
  }

  const handleReturnToExplorer = () => {
      setViewMode('fileTree');
      setActiveFile(fileTree[0].children![0] as FileNode);
  }

  return (
    <SidebarProvider>
      <Sidebar>
        {viewMode === 'fileTree' ? (
             <FileExplorer 
                files={fileTree} 
                onFileSelect={handleFileSelect} 
                activeFile={activeFile}
                onFileUpload={handleFileUpload}
            />
        ) : (
            <div className="p-4 flex flex-col h-full">
                <h2 className="font-semibold text-lg mb-4 text-center">File Uploaded</h2>
                <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                    <p>Your uploaded file is displayed in the main panel. Use the AI tools to analyze it.</p>
                </div>
                 <Button onClick={handleReturnToExplorer}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to File Explorer
                </Button>
            </div>
        )}
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
