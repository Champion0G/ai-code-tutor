
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
import { getFileContent } from "@/ai/flows/get-file-content";
import { useToast } from "@/hooks/use-toast";

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
                parentNode.children!.push(node);
            }
        });
    });
    
    // If the root is a single folder, we return its children for a cleaner tree
    if (root.children && root.children.length === 1 && root.children[0].type === 'folder') {
        const singleRoot = root.children[0];
        // Handle cases where the root folder might just contain other folders
        const processedChildren = singleRoot.children?.map(child => {
            const newPath = child.path.substring(singleRoot.name.length + 1);
            
            const updatePaths = (node: FileNode, basePath: string): FileNode => {
                const relativePath = node.path.substring(basePath.length + 1);
                const newNode = { ...node, path: relativePath };
                if (newNode.children) {
                    newNode.children = newNode.children.map(c => updatePaths(c, basePath));
                }
                return newNode;
            }

            return updatePaths(child, singleRoot.name);
        });

        // If the uploaded folder has a simple structure, the original logic might be better
        if(processedChildren && processedChildren.every(c => !c.path.includes('/'))) {
             return singleRoot.children || [];
        }
       
        // This is complex, let's stick to the simpler version that was working before the last change
        return root.children || [];
    }

    return root.children || [];
  });
}


export function MainLayout() {
  const [fileTree, setFileTree] = useState<FileNode[]>(initialFileTree);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Set initial active file from the file tree
    const findFirstFile = (nodes: FileNode[]): FileNode | null => {
        for(const node of nodes) {
            if(node.type === 'file' && node.content) return node;
            if(node.children) {
                const found = findFirstFile(node.children);
                if (found) return found;
            }
        }
        return null;
    }
    const firstFile = findFirstFile(fileTree);
    if(firstFile) {
        setActiveFile(firstFile);
    } else {
        // If no file has content (e.g., from a fresh GitHub import),
        // select the first file found but don't expect content yet.
        const findAnyFirstFile = (nodes: FileNode[]): FileNode | null => {
            for(const node of nodes) {
                if(node.type === 'file') return node;
                if(node.children) {
                    const found = findAnyFirstFile(node.children);
                    if (found) return found;
                }
            }
            return null;
        }
        setActiveFile(findAnyFirstFile(fileTree));
    }
  }, [fileTree])

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
                setFileTree(prevTree => updateFileContent(prevTree, file.path, content));
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
  }, [toast]);

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

  const handleRepoImport = (newFileTree: FileNode[]) => {
    setFileTree(newFileTree);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <FileExplorer 
            files={fileTree} 
            onFileSelect={handleFileSelect} 
            activeFile={activeFile}
            onFileUpload={handleFileUpload}
            onFolderUpload={handleFolderUpload}
            onRepoImport={handleRepoImport}
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
