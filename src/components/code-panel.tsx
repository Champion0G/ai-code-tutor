
"use client";

import type { FileNode } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileIcon } from "lucide-react";

interface CodePanelProps {
  file: FileNode | null;
  onMouseUp: () => void;
}

export function CodePanel({ file, onMouseUp }: CodePanelProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <FileIcon className="h-5 w-5" />
        <CardTitle className="text-lg">{file?.name || "Select a file"}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <pre
            className="p-4 text-sm font-code h-full w-full whitespace-pre-wrap break-all"
            onMouseUp={onMouseUp}
          >
            <code>{file?.content || "No file selected."}</code>
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
