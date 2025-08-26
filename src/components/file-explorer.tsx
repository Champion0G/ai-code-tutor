
"use client";

import type { FileNode } from "@/lib/mock-data";
import { useState, useRef } from "react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { FolderIcon, FileIcon, ChevronRightIcon, Upload, FolderUp } from "lucide-react";
import { CodeAlchemistIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  activeFile: FileNode | null;
  onFileUpload: (file: File) => void;
  onFolderUpload: (files: File[]) => void;
}

const ExplorerNode = ({ node, onFileSelect, activeFile, level }: { node: FileNode, onFileSelect: (file: FileNode) => void, activeFile: FileNode | null, level: number }) => {
  const [isOpen, setIsOpen] = useState(node.type === 'folder' ? true : false);

  const handleNodeClick = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    }
    if (node.type === 'file') {
        onFileSelect(node);
    }
  };

  const isFolder = node.type === 'folder';
  const isActive = activeFile?.path === node.path;

  return (
    <>
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
      </SidebarMenuItem>
      {isFolder && isOpen && node.children && (
        <ul className="pl-2">
          {node.children.map((child) => (
            <ExplorerNode
              key={child.path}
              node={child}
              onFileSelect={onFileSelect}
              activeFile={activeFile}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </>
  );
};

export function FileExplorer({ files, onFileSelect, activeFile, onFileUpload, onFolderUpload }: FileExplorerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      if (fileList.length === 1 && !fileList[0].webkitRelativePath) {
        onFileUpload(fileList[0]);
      } else {
        onFolderUpload(Array.from(fileList));
      }
    }
    // Reset file input to allow uploading the same file/folder again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (folderInputRef.current) {
        folderInputRef.current.value = '';
    }
  };

  const handleUploadFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFolderClick = () => {
    folderInputRef.current?.click();
  }

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <CodeAlchemistIcon className="h-6 w-6 text-primary" />
          <h2 className="font-semibold text-lg">File Explorer</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
        />
         <input
            type="file"
            ref={folderInputRef}
            onChange={handleFileChange}
            className="hidden"
            // @ts-expect-error - webkitdirectory is a non-standard attribute
            webkitdirectory=""
            mozdirectory=""
            directory=""
            multiple
        />
        <div className="flex gap-2">
            <Button variant="outline" className="w-full" onClick={handleUploadFileClick}>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
            </Button>
            <Button variant="outline" className="w-full" onClick={handleUploadFolderClick}>
                <FolderUp className="mr-2 h-4 w-4" />
                Upload Folder
            </Button>
        </div>
        <SidebarSeparator className="my-2" />
        <div className="flex-1 overflow-auto">
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
        </div>
      </SidebarContent>
    </>
  );
}
