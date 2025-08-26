
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
    return new Promise((resolve) => {
        const fileTree: FileNode[] = [];
        const filePromises = files.map(file => {
            return new Promise<{ path: string, content: string }>(resolveFile => {
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

        Promise.all(filePromises).then(fileData => {
            const root: { [key: string]: FileNode } = {};

            fileData.forEach(({ path, content }) => {
                const parts = path.split('/');
                let currentLevel = root;
                let currentPath = '';

                parts.forEach((part, index) => {
                    if (!part) return;

                    currentPath = index === 0 ? part : `${currentPath}/${part}`;
                    
                    const isFile = index === parts.length - 1;

                    if (!currentLevel[part]) {
                        currentLevel[part] = {
                            name: part,
                            type: isFile ? 'file' : 'folder',
                            path: currentPath,
                            children: isFile ? undefined : [],
                        };
                    }
                    
                    if(isFile) {
                        currentLevel[part].content = content;
                    } else {
                        currentLevel = currentLevel[part].children!.reduce((acc, child) => {
                            acc[child.name] = child;
                            return acc;
                        }, {} as { [key: string]: FileNode });
                    }
                });
            });
            
            // This is a simplified transformation, might need more robust logic for nested children
            const transform = (level: { [key: string]: FileNode }): FileNode[] => {
                 return Object.values(level).map(node => {
                    if (node.type === 'folder' && node.children) {
                        const childrenAsObject = node.children.reduce((acc, child) => {
                            acc[child.name] = child;
                            return acc;
                        }, {} as {[key: string]: FileNode});
                        node.children = transform(childrenAsObject)
                    }
                    return node;
                })
            }
            resolve(transform(root));
        });
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
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <FileExplorer 
            files={fileTree} 
            onFileSelect={handleFileSelect} 
            activeFile={activeFile}
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
