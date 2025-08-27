
"use client";

import type { FileNode } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FileIcon } from "lucide-react";

interface CodePanelProps {
  file: FileNode | null;
  onMouseUp: () => void;
}

export function CodePanel({ file, onMouseUp }: CodePanelProps) {
  let displayContent: string;

  if (!file) {
    displayContent = "No file selected.";
  } else if (file.content) {
    displayContent = file.content;
  } else if (!file.content && file.path.startsWith('https://api.github.com')) {
    displayContent = "Loading file content...";
  } else {
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
          <pre
            className="p-4 text-sm font-code"
            onMouseUp={onMouseUp}
          >
            <code>{displayContent}</code>
          </pre>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
