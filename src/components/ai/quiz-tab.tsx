
"use client";

import { useState, useEffect } from "react";
import { generateQuiz } from "@/ai/flows/generate-quiz";
import type { GenerateQuizOutput } from "@/ai/flows/generate-quiz";
import { QuizView } from "@/components/quiz-view";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface QuizTabProps {
  fileName: string;
  fileContent: string;
  onCorrectAnswer: () => void;
}

export function QuizTab({ fileName, fileContent, onCorrectAnswer }: QuizTabProps) {
  const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0); // Used to re-mount the quiz view

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setQuiz(null);

    try {
      const result = await generateQuiz({ fileContent, fileName });
      setQuiz(result);
      setKey(k => k + 1); // Force re-mount of QuizView
    } catch (e) {
      setError("Failed to generate quiz. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (fileContent) {
      handleGenerateQuiz();
    }
    // We only want to run this when the file actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileContent, fileName]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full space-y-4">
        <div>
          <h3 className="text-lg font-semibold"><Skeleton className="h-6 w-48" /></h3>
          <div className="text-sm text-muted-foreground mt-1"><Skeleton className="h-4 w-64" /></div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground mt-4">Generating Quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive text-center py-10">{error}</div>;
  }

  if (!quiz) {
    return <div className="text-muted-foreground text-center py-10">No quiz available.</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{quiz.title}</h3>
          <p className="text-sm text-muted-foreground">Test your knowledge about {fileName}.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleGenerateQuiz} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            New Quiz
        </Button>
      </div>
      <div className="flex-1 overflow-auto -mx-4 px-2 py-2">
          <QuizView
            key={key}
            quiz={quiz}
            onCorrectAnswer={onCorrectAnswer}
            onQuizComplete={() => {}} // This is handled internally or not needed here
        />
      </div>
    </div>
  );
}
