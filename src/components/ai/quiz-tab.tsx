"use client";

import { useState, useEffect } from "react";
import { generateQuiz } from "@/ai/flows/generate-quiz";
import type { GenerateQuizOutput } from "@/ai/flows/generate-quiz";
import { QuizView } from "@/components/quiz-view";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface QuizTabProps {
  fileName: string;
  fileContent: string;
  onCorrectAnswer: () => void;
}

export function QuizTab({ fileName, fileContent, onCorrectAnswer }: QuizTabProps) {
  const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(fileName); // Used to re-mount the quiz view when file changes

  useEffect(() => {
    if (fileContent) {
      handleGenerateQuiz();
      setKey(fileName);
    }
  }, [fileContent, fileName]);

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setQuiz(null);

    try {
      const result = await generateQuiz({ fileContent, fileName });
      setQuiz(result);
    } catch (e) {
      setError("Failed to generate quiz. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full space-y-4">
        <div>
          <h3 className="text-lg font-semibold"><Skeleton className="h-6 w-48" /></h3>
          <p className="text-sm text-muted-foreground mt-1"><Skeleton className="h-4 w-64" /></p>
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
      <div>
        <h3 className="text-lg font-semibold">{quiz.title}</h3>
        <p className="text-sm text-muted-foreground">Test your knowledge about {fileName}.</p>
      </div>
      <div className="flex-1 overflow-auto -mx-4 px-4">
          <QuizView
            key={key}
            quiz={quiz}
            onCorrectAnswer={onCorrectAnswer}
        />
      </div>
    </div>
  );
}
