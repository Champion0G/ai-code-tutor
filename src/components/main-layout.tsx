
"use client";

import { useState, useCallback } from "react";
import type { FileNode } from "@/lib/mock-data";
import { fileTree as initialFileTree } from "@/lib/mock-data";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { FileExplorer } from "@/components/file-explorer";
import { CodePanel } from "@/components/code-panel";
import { AiPanel } from "@/components/ai-panel";
import { getFileContent } from "@/ai/flows/get-file-content";
import { useToast } from "@/hooks/use-toast";
import { ProjectProvider, useProject } from "@/contexts/project-context";


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
    const nodeMap: { [path: string]: FileNode } = { '': root };

    fileData.forEach(({ path, content }) => {
        const parts = path.split('/').filter(p => p);
        let currentPath = '';
        
        parts.forEach((part, index) => {
            const parentPath = currentPath;
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            const parentNode = nodeMap[parentPath];

            if (!nodeMap[currentPath]) {
                const isFile = index === parts.length - 1;
                const node: FileNode = {
                    name: part,
                    path: currentPath,
                    type: isFile ? 'file' : 'folder',
                    children: isFile ? undefined : [],
                };
                if (isFile) {
                    node.content = content;
                }
                nodeMap[currentPath] = node;
                if(parentNode && parentNode.children) {
                    parentNode.children!.push(node);
                } else {
                    // This handles the case where the path doesn't have a parent in the map
                    root.children!.push(node);
                }
            }
        });
    });
    
    return root.children || [];
  });
}


function MainLayoutContent() {
  const { 
    fileTree, 
    setFileTree, 
    activeFile, 
    setActiveFile, 
    setProjectName,
    projectName
   } = useProject();

  const [selectedSnippet, setSelectedSnippet] = useState<string>("");
  const { toast } = useToast();
  
  const handleFileSelect = useCallback(async (file: FileNode) => {
    if (file.type === "file") {
        if (!file.content && file.path.startsWith('https://api.github.com')) {
             try {
                const { content } = await getFileContent({ downloadUrl: file.path });
                
                // We need to update the file in the tree so we don't re-fetch it
                const updateFileContent = (nodes: FileNode[], path: string, newContent: string): FileNode[] => {
                    return nodes.map(node => {
                        if (node.path === path) {
                            return { ...node, content: newContent };
                        }
                        if (node.children) {
                            return { ...node, children: updateFileContent(node.children, path, newContent) };
                        }
                        return node;
                    });
                };
                
                const newFileWithContent = { ...file, content };
                
                setFileTree(prevTree => {
                    const updatedTree = updateFileContent(prevTree, file.path, content);
                    return updatedTree;
                });
                setActiveFile(newFileWithContent);

            } catch (error) {
                 console.error("Failed to fetch file content:", error);
                 toast({
                     variant: "destructive",
                     title: "Error",
                     description: "Could not fetch file content from GitHub."
                 });
                 // Still set the active file, but with an error message
                 setActiveFile({ ...file, content: "Error: Could not load file content." });
            }
        } else {
            setActiveFile(file);
        }
        setSelectedSnippet("");
    }
  }, [toast, setFileTree, setActiveFile]);

  const handleSnippetSelect = () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      setSelectedSnippet(selection);
    }
  };

  const handleFolderUpload = async (files: File[]) => {
    if (files.length > 0) {
      const folderName = files[0].webkitRelativePath.split('/')[0];
      setProjectName(folderName);
    }
    const newFileTree = await buildFileTree(files);
    setFileTree(newFileTree);
    setActiveFile(null); // Reset active file
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
        const newTree = [newFileNode];
        setFileTree(newTree);
        setActiveFile(newFileNode);
        setProjectName(file.name);
    }
    reader.readAsText(file);
  }

  const handleRepoImport = (repoName: string, newFileTree: FileNode[]) => {
    setProjectName(repoName);
    setFileTree(newFileTree);
    setActiveFile(null); // Reset active file
  };

  const handleReset = () => {
      setFileTree(initialFileTree);
      setActiveFile(null);
      setProjectName("Code Alchemist Example");
      toast({
          title: "Project Reset",
          description: "Showing the default example project."
      });
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <FileExplorer 
            onFileSelect={handleFileSelect} 
            onFileUpload={handleFileUpload}
            onFolderUpload={handleFolderUpload}
            onRepoImport={handleRepoImport}
            onReset={handleReset}
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
                fileTree={fileTree}
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

export function MainLayout() {
  return (
    <ProjectProvider>
      <MainLayoutContent />
    </ProjectProvider>
  )
}
