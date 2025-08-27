
"use client";

import type { FileNode } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FileIcon, Menu } from "lucide-react";

interface CodePanelProps {
  file: FileNode | null;
  onMouseUp: () => void;
}

export function CodePanel({ file, onMouseUp }: CodePanelProps) {
  let displayContent: string | null = null;
  let view: 'content' | 'loading' | 'error' | 'no-file' = 'no-file';

  if (!file) {
    view = 'no-file';
  } else if (file.content?.startsWith("Error:")) {
    view = 'error';
    displayContent = file.content;
  } else if (file.content) {
    view = 'content';
    displayContent = file.content;
  } else if (!file.content && file.path.startsWith('https://api.github.com')) {
    view = 'loading';
    displayContent = "Loading file content...";
  } else {
    view = 'error';
    displayContent = "Content not loaded. Please re-upload the folder to view this file.";
  }


  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <FileIcon className="h-5 w-5" />
        <CardTitle className="text-lg">{file?.name || "Select a file"}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full w-full">
          {view === 'no-file' ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
              <FileIcon className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No File Selected</h3>
              <p className="mt-1">Select a file from the sidebar to view its content.</p>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm md:hidden">
                <p className="flex items-center justify-center gap-2 font-semibold text-foreground">
                  <Menu className="h-5 w-5" />
                  <span>On Mobile?</span>
                </p>
                <p className="mt-2">Tap the menu icon in the header to open the sidebar and upload files or import a repository.</p>
              </div>
            </div>
          ) : view === 'loading' ? (
             <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>{displayContent}</p>
            </div>
          ) : view === 'error' ? (
             <div className="flex items-center justify-center h-full text-destructive p-4 text-center">
              <p>{displayContent}</p>
            </div>
          ) : (
            <pre
              className="p-4 text-sm font-code"
              onMouseUp={onMouseUp}
            >
              <code>{displayContent}</code>
            </pre>
          )}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
