
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { FileNode } from '@/lib/mock-data';
import { fileTree as initialFileTree } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY_TREE = 'lexer-file-tree';
const LOCAL_STORAGE_KEY_NAME = 'lexer-project-name';

interface ProjectContextType {
  projectName: string;
  setProjectName: (name: string) => void;
  fileTree: FileNode[];
  setFileTree: (tree: FileNode[]) => void;
  activeFile: FileNode | null;
  setActiveFile: (file: FileNode | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projectName, setProjectNameState] = useState<string>('Code Alchemist Example');
  const [fileTree, setFileTreeState] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const { toast } = useToast();


  useEffect(() => {
    try {
        const savedTree = localStorage.getItem(LOCAL_STORAGE_KEY_TREE);
        const savedName = localStorage.getItem(LOCAL_STORAGE_KEY_NAME);
        if (savedTree && savedName) {
            setFileTreeState(JSON.parse(savedTree));
            setProjectNameState(savedName);
        } else {
            setFileTreeState(initialFileTree);
            setProjectNameState("Code Alchemist Example");
        }
    } catch (error) {
        console.error("Failed to load from localStorage", error);
        setFileTreeState(initialFileTree);
        setProjectNameState("Code Alchemist Example");
    }
  }, []);

  const saveTreeToLocalStorage = (tree: FileNode[]) => {
      try {
          const treeWithoutContent = JSON.parse(JSON.stringify(tree));
          const stripContent = (nodes: FileNode[]) => {
              nodes.forEach(node => {
                  if (node.type === 'file') {
                      delete node.content;
                  }
                  if (node.children) {
                      stripContent(node.children);
                  }
              });
          };
          stripContent(treeWithoutContent);
          localStorage.setItem(LOCAL_STORAGE_KEY_TREE, JSON.stringify(treeWithoutContent));
      } catch (error) {
          console.error("Failed to save tree to localStorage", error);
          toast({
              variant: "destructive",
              title: "Could not save project tree",
              description: "The browser's local storage might be full."
          })
      }
  }

  const saveNameToLocalStorage = (name: string) => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_NAME, name);
      } catch (error) {
           console.error("Failed to save name to localStorage", error);
      }
  }

  const setFileTree = (tree: FileNode[]) => {
      setFileTreeState(tree);
      saveTreeToLocalStorage(tree);
  }

  const setProjectName = (name: string) => {
      setProjectNameState(name);
      saveNameToLocalStorage(name);
  }

  return (
    <ProjectContext.Provider value={{ 
        projectName, 
        setProjectName,
        fileTree, 
        setFileTree, 
        activeFile, 
        setActiveFile 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
