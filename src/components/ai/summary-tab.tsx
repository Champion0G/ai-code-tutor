
"use client";

import { useState } from "react";
import { summarizeRepository } from "@/ai/flows/summarize-repository";
import { answerFileQuestion } from "@/ai/flows/summarize-file-and-qa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { BookText, HelpCircle, FolderGit2, Sparkles, WandSparkles } from "lucide-react";
import { Separator } from "../ui/separator";
import type { FileNode } from "@/lib/mock-data";
import { useGamification } from "@/contexts/gamification-context";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface SummaryTabProps {
  fileContent: string;
  fileName: string;
  fileTree: FileNode[];
  onSummary: () => void;
}

interface QnaPair {
    question: string;
    answer: string;
}

const exampleQuestions = [
    "Explain this file/folder/repo in simple terms",
    "What is the main purpose of this code?",
    "How does this file fit into the project?",
]

export function SummaryTab({ fileContent, fileName, fileTree, onSummary }: SummaryTabProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [qnaHistory, setQnaHistory] = useState<QnaPair[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRepoLoading, setIsRepoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkAndIncrementUsage } = useGamification();

  const handleGenerateSummary = async () => {
    const canProceed = await checkAndIncrementUsage();
    if (!canProceed) {
        setError("You have reached your daily AI usage limit.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setSummary(null);
    setQnaHistory([]);
    setQuestion("");

    try {
        const response = await answerFileQuestion({
            context: fileContent,
            question: "Provide a concise summary of this file.",
        });
        setSummary(response.answer);
        onSummary();
    } catch(e) {
        setError("Failed to generate summary. Please try again.");
    } finally {
        setIsLoading(false);
    }
  }

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
    setSummary(null);
    setQnaHistory([]);

    try {
        const response = await summarizeRepository({ fileTree });
        setSummary(response.summary);
        onSummary();
    } catch(e) {
        setError("Failed to summarize repository. Please try again.");
        console.error(e);
    } finally {
        setIsRepoLoading(false);
    }
  };

  const handleAskQuestion = async (q?: string) => {
    const currentQuestion = q || question;
    if (!currentQuestion) return;

    const canProceed = await checkAndIncrementUsage();
    if (!canProceed) {
      setError("You have reached your daily AI usage limit.");
      return;
    }

    const context = summary || fileContent || "the current project";
    if (!context) {
      setError("Please generate a summary or select a file before asking questions.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await answerFileQuestion({ context, question: currentQuestion });
      setQnaHistory(prev => [...prev, { question: currentQuestion, answer: response.answer }]);
      setQuestion("");
      onSummary(); // Award XP for asking a question
    } catch(e) {
      setError("Failed to get an answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleExampleClick = (example: string) => {
    setQuestion(example);
    handleAskQuestion(example);
  }

  const isLoadingFileSummary = isLoading && !summary;
  const canAskQuestions = !!fileContent || !!summary || fileTree.length > 0;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex-shrink-0">
        <h3 className="text-lg font-semibold">Summary & Q&A</h3>
        <p className="text-sm text-muted-foreground">
          Generate a summary or ask specific questions about the selected file (<strong>{fileName || "none"}</strong>) or repository.
        </p>
      </div>
      
      <div className="flex-shrink-0 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button onClick={handleGenerateSummary} disabled={isLoading || isRepoLoading || !fileContent}>
                <WandSparkles className="mr-2 h-4 w-4" />
                {isLoading && !isRepoLoading ? "Summarizing File..." : "Generate File Summary"}
            </Button>
            <Button onClick={handleRepoSummary} disabled={isRepoLoading || isLoading || fileTree.length === 0}>
                <FolderGit2 className="mr-2 h-4 w-4" />
                {isRepoLoading ? "Summarizing..." : "Summarize Repo"}
            </Button>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex-1 overflow-auto bg-muted/50 rounded-lg p-2 min-h-[200px]">
        <ScrollArea className="h-full p-2">
        {isLoading || isRepoLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
        ) : error ? (
            <div className="text-destructive p-4">{error}</div>
        ) : summary || qnaHistory.length > 0 ? (
          <div className="space-y-4">
            {summary && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                        <p>{summary}</p>
                    </CardContent>
                </Card>
            )}
            {qnaHistory.map((item, index) => (
                <div key={index} className="space-y-2">
                    <p className="font-semibold text-sm">Q: {item.question}</p>
                    <p className="text-sm prose prose-sm dark:prose-invert max-w-none">{item.answer}</p>
                    {index < qnaHistory.length -1 && <Separator />}
                </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-10">
            Summaries and answers will appear here.
          </div>
        )}
        </ScrollArea>
      </div>
      
       <div className="flex-shrink-0 space-y-2">
         <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((q) => (
                <Button key={q} size="sm" variant="outline" className="text-xs" onClick={() => handleExampleClick(q)} disabled={isLoading || isRepoLoading || !canAskQuestions}>
                    <Sparkles className="mr-2 h-3 w-3" />
                    {q}
                </Button>
            ))}
        </div>
        <form
            onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
            }}
            className="flex w-full items-center space-x-2"
        >
            <Input
            type="text"
            placeholder="Ask a follow-up question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading || isRepoLoading || !canAskQuestions}
            />
            <Button type="submit" disabled={!question || isLoading || isRepoLoading || !canAskQuestions}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Ask
            </Button>
        </form>
      </div>

    </div>
  );
}
