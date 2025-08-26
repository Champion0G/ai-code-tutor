"use client";

import type { FileNode } from "@/lib/mock-data";
import { useState } from "react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { CodeAlchemistIcon, FolderIcon, FileIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  activeFile: FileNode | null;
}

const ExplorerNode = ({ node, onFileSelect, activeFile, level }: { node: FileNode, onFileSelect: (file: FileNode) => void, activeFile: FileNode | null, level: number }) => {
  const [isOpen, setIsOpen] = useState(node.type === 'folder' ? true : false);

  const handleNodeClick = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    }
    onFileSelect(node);
  };

  const isFolder = node.type === 'folder';
  const isActive = activeFile?.path === node.path;

  return (
    <SidebarMenuItem>
      <div
        className="flex items-center w-full"
        style={{ paddingLeft: `${level * 1}rem` }}
      >
        {isFolder ? (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNodeClick}>
            <ChevronRightIcon
              className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")}
            />
          </Button>
        ) : (
          <div className="w-6" /> 
        )}
        <SidebarMenuButton
          onClick={handleNodeClick}
          className="flex-1 h-8 justify-start gap-2 pl-1"
          isActive={isActive}
          size="sm"
        >
          {isFolder ? (
            <FolderIcon className="h-4 w-4 text-sky-500" />
          ) : (
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          )}
          <span>{node.name}</span>
        </SidebarMenuButton>
      </div>
      {isFolder && isOpen && node.children && (
        <div className="pl-2">
          {node.children.map((child) => (
            <ExplorerNode
              key={child.path}
              node={child}
              onFileSelect={onFileSelect}
              activeFile={activeFile}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </SidebarMenuItem>
  );
};

export function FileExplorer({ files, onFileSelect, activeFile }: FileExplorerProps) {
  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <CodeAlchemistIcon className="h-6 w-6 text-primary" />
          <h2 className="font-semibold text-lg">File Explorer</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {files.map((node) => (
            <ExplorerNode
              key={node.path}
              node={node}
              onFileSelect={onFileSelect}
              activeFile={activeFile}
              level={0}
            />
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
