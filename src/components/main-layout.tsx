
"use client";

import { useState, useCallback, useEffect } from "react";
import type { FileNode } from "@/lib/mock-data";
import { fileTree as initialFileTree } from "@/lib/mock-data";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { FileExplorer } from "@/components/file-explorer";
import { CodePanel } from "@/components/code-panel";
import { AiPanel } from "@/components/ai-panel";


// Helper function to build a file tree from a flat list of files
function buildFileTree(files: File[]): Promise<FileNode[]> {
  const filePromises = files.map(file => {
    return new Promise<{ path: string; content: string }>(resolveFile => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolveFile({
          path: file.webkitRelativePath,
          content: e.target?.result as string,
        });
      };
      reader.onerror = () => {
        resolveFile({ path: file.webkitRelativePath, content: "Error reading file" });
      }
      reader.readAsText(file);
    });
  });

  return Promise.all(filePromises).then(fileData => {
    const root: FileNode = { name: 'root', path: '', type: 'folder', children: [] };
    
    fileData.forEach(({ path, content }) => {
      const parts = path.split('/').filter(p => p); // remove empty strings
      let currentLevel = root;
      
      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        let existingNode = currentLevel.children?.find(node => node.name === part);

        if (existingNode) {
          if (!isFile) {
            currentLevel = existingNode;
          }
        } else {
          const newNode: FileNode = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : [],
          };

          if (isFile) {
            newNode.content = content;
          }

          if (!currentLevel.children) {
              currentLevel.children = [];
          }
          currentLevel.children.push(newNode);

          if (!isFile) {
            currentLevel = newNode;
          }
        }
      });
    });

    // We only care about the children of the first directory level
    if (root.children && root.children.length > 0 && root.children[0].type === 'folder' && root.children[0].children) {
      return root.children[0].children;
    }
    
    return root.children || [];
  });
}


export function MainLayout() {
  const [fileTree, setFileTree] = useState<FileNode[]>(initialFileTree);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<string>("");

  useEffect(() => {
    // Set initial active file from the file tree
    const findFirstFile = (nodes: FileNode[]): FileNode | null => {
        for(const node of nodes) {
            if(node.type === 'file') return node;
            if(node.children) {
                const found = findFirstFile(node.children);
                if (found) return found;
            }
        }
        return null;
    }
    setActiveFile(findFirstFile(fileTree));
  }, [fileTree])

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

  const handleFolderUpload = async (files: File[]) => {
    const newFileTree = await buildFileTree(files);
    setFileTree(newFileTree);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target?.result as string;
        const newFileNode: FileNode = {
            name: file.name,
            type: 'file',
            path: file.name,
            content: content
        };
        // Replace entire tree with the single file
        setFileTree([newFileNode]);
        setActiveFile(newFileNode);
    }
    reader.readAsText(file);
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <FileExplorer 
            files={fileTree} 
            onFileSelect={handleFileSelect} 
            activeFile={activeFile}
            onFileUpload={handleFileUpload}
            onFolderUpload={handleFolderUpload}
        />
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
