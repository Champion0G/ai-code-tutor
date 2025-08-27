
"use client";

import { useState } from "react";
import { summarizeFileAndQA } from "@/ai/flows/summarize-file-and-qa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { BookText, HelpCircle } from "lucide-react";
import { Separator } from "../ui/separator";

interface SummaryTabProps {
  fileContent: string;
  fileName: string;
  onSummary: () => void;
}

export function SummaryTab({ fileContent, fileName, onSummary }: SummaryTabProps) {
  const [result, setResult] = useState<{ summary: string; answer: string } | null>(null);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (isNewSummary: boolean) => {
    if (!fileContent) {
      setError("No file content to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    if (isNewSummary) {
      setResult(null);
    }

    try {
      const response = await summarizeFileAndQA({
        fileContent,
        question: isNewSummary ? "Provide a summary of this file." : question,
      });
      setResult(response);
      if (isNewSummary) {
        onSummary();
      }
    } catch (e) {
      setError("Failed to process the file. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="mt-4">
        <h3 className="text-lg font-semibold">File Summary & Q&A</h3>
        <p className="text-sm text-muted-foreground">
          Get a summary of <strong>{fileName}</strong> and ask questions about it.
        </p>
      </div>
      
      <div className="flex-shrink-0 space-y-4">
        <Button onClick={() => handleAction(true)} disabled={isLoading || !fileContent} className="w-full">
            <BookText className="mr-2 h-4 w-4" />
            {isLoading && !result ? "Summarizing..." : "Generate File Summary"}
        </Button>
        
        <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center">
                <div className="mx-auto bg-card px-2 text-xs text-muted-foreground">OR</div>
            </div>
        </div>

        <form
            onSubmit={(e) => {
            e.preventDefault();
            handleAction(false);
            }}
            className="flex w-full items-center space-x-2"
        >
            <Input
            type="text"
            placeholder="Ask a question about the file..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            />
            <Button type="submit" disabled={!question || isLoading || !fileContent}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Ask
            </Button>
        </form>
      </div>

      <Separator className="my-4" />

      <div className="flex-1 overflow-auto bg-muted/50 rounded-lg p-4 min-h-[150px]">
        <ScrollArea className="h-full">
        {isLoading && !result ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
        ) : error ? (
            <div className="text-destructive">{error}</div>
        ) : result ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Summary:</h4>
              <p className="text-sm whitespace-pre-wrap">{result.summary}</p>
            </div>
            {result.answer && question && (
              <div>
                <Separator className="my-4" />
                <h4 className="font-semibold mb-2">Answer:</h4>
                <p className="text-sm whitespace-pre-wrap">{result.answer}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-10">
            Summary and answers will appear here.
          </div>
        )}
        </ScrollArea>
      </div>

    </div>
  );
}
