
"use client";

import { useState } from "react";
import { summarizeFileAndQA } from "@/ai/flows/summarize-file-and-qa";
import { summarizeRepository } from "@/ai/flows/summarize-repository";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { BookText, HelpCircle, FolderGit2, Sparkles } from "lucide-react";
import { Separator } from "../ui/separator";
import type { FileNode } from "@/lib/mock-data";
import { useGamification } from "@/contexts/gamification-context";

interface SummaryTabProps {
  fileContent: string;
  fileName: string;
  fileTree: FileNode[];
  onSummary: () => void;
}

const exampleQuestions = [
    "Explain this file/folder/repo in simple terms",
    "What is the main purpose of this code?",
    "How does this file fit into the project?",
]

export function SummaryTab({ fileContent, fileName, fileTree, onSummary }: SummaryTabProps) {
  const [fileResult, setFileResult] = useState<{ summary: string; answer: string } | null>(null);
  const [repoSummary, setRepoSummary] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRepoLoading, setIsRepoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkAndIncrementUsage } = useGamification();

  const handleFileAction = async (isNewSummary: boolean, q?: string) => {
    const canProceed = await checkAndIncrementUsage();
    if (!canProceed) {
        setError("You have reached your daily AI usage limit.");
        return;
    }

    const context = fileContent || repoSummary;
    if (!context && !isRepoLoading) {
      setError("Please summarize a file or repository before asking questions.");
      return;
    }

    const currentQuestion = q || question;

    setIsLoading(true);
    setError(null);
    if (isNewSummary) {
      setFileResult(null);
      setRepoSummary(null);
      setQuestion("");
    }

    try {
      const response = await summarizeFileAndQA({
        fileContent: context || "",
        question: isNewSummary ? `Provide a summary of this file.` : currentQuestion,
      });

      if (isNewSummary) {
        setFileResult(response);
      } else {
        setFileResult(prev => ({ summary: prev?.summary || "", answer: response.answer }));
      }
      
      setQuestion(currentQuestion);
      onSummary();
    } catch (e) {
      setError("Failed to process the file. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepoSummary = async () => {
    if (!fileTree || fileTree.length === 0) {
      setError("No folder structure available to summarize.");
      return;
    }

    const canProceed = await checkAndIncrementUsage();
    if (!canProceed) {
        setError("You have reached your daily AI usage limit.");
        return;
    }

    setIsRepoLoading(true);
    setError(null);
    setFileResult(null);
    setRepoSummary(null);

    try {
        const response = await summarizeRepository({ fileTree });
        setRepoSummary(response.summary);
        setFileResult({ summary: response.summary, answer: "" });
        onSummary();
    } catch(e) {
        setError("Failed to summarize repository. Please try again.");
        console.error(e);
    } finally {
        setIsRepoLoading(false);
    }
  };
  
  const handleExampleClick = (example: string) => {
    setQuestion(example);
  }

  const isLoadingFileSummary = isLoading && !fileResult;
  const canAskQuestions = !!fileContent || !!repoSummary || fileTree.length > 0;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex-shrink-0">
        <h3 className="text-lg font-semibold">File & Repository Summary</h3>
        <p className="text-sm text-muted-foreground">
          Get a summary of the selected file (<strong>{fileName || "none"}</strong>) or the entire repository.
        </p>
      </div>
      
      <div className="flex-shrink-0 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button onClick={() => handleFileAction(true)} disabled={isLoading || isRepoLoading || !fileContent}>
                <BookText className="mr-2 h-4 w-4" />
                {isLoadingFileSummary ? "Summarizing File..." : "Summarize Current File"}
            </Button>
            <Button onClick={handleRepoSummary} disabled={isRepoLoading || isLoading || fileTree.length === 0}>
                <FolderGit2 className="mr-2 h-4 w-4" />
                {isRepoLoading ? "Summarizing..." : "Summarize Repo/Folder"}
            </Button>
        </div>
        
        <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center">
                <div className="mx-auto bg-card px-2 text-xs text-muted-foreground">OR</div>
            </div>
        </div>

        <form
            onSubmit={(e) => {
            e.preventDefault();
            handleFileAction(false);
            }}
            className="flex w-full items-center space-x-2"
        >
            <Input
            type="text"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading || isRepoLoading || !canAskQuestions}
            />
            <Button type="submit" disabled={!question || isLoading || isRepoLoading || !canAskQuestions}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Ask
            </Button>
        </form>

        <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((q) => (
                <Button key={q} size="sm" variant="outline" className="text-xs" onClick={() => handleExampleClick(q)} disabled={isLoading || isRepoLoading || !canAskQuestions}>
                    <Sparkles className="mr-2 h-3 w-3" />
                    {q}
                </Button>
            ))}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex-1 overflow-auto bg-muted/50 rounded-lg p-4 min-h-[150px]">
        <ScrollArea className="h-full">
        {isLoading || isRepoLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
        ) : error ? (
            <div className="text-destructive">{error}</div>
        ) : repoSummary && !fileContent ? (
            <div>
              <h4 className="font-semibold mb-2 text-base">Repository Summary:</h4>
              <p className="text-sm whitespace-pre-wrap">{repoSummary}</p>
              {fileResult?.answer && question && (
                 <div>
                    <Separator className="my-4" />
                    <h4 className="font-semibold mb-2">Answer to "{question}":</h4>
                    <p className="text-sm whitespace-pre-wrap">{fileResult.answer}</p>
                 </div>
              )}
            </div>
        ) : fileResult ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Summary for {fileName}:</h4>
              <p className="text-sm whitespace-pre-wrap">{fileResult.summary}</p>
            </div>
            {fileResult.answer && question && (
              <div>
                <Separator className="my-4" />
                <h4 className="font-semibold mb-2">Answer to "{question}":</h4>
                <p className="text-sm whitespace-pre-wrap">{fileResult.answer}</p>
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
