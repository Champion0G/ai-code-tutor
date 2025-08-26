"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenerateQuizOutput } from "@/ai/flows/generate-quiz";
import { generateQuiz } from "@/ai/flows/generate-quiz";
import { Skeleton } from "../ui/skeleton";

interface QuizTabProps {
  fileName: string;
  fileContent: string;
  onCorrectAnswer: () => void;
}

export function QuizTab({ fileName, fileContent, onCorrectAnswer }: QuizTabProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fileContent) {
      handleGenerateQuiz();
    }
  }, [fileContent, fileName]);

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);

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


  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);
    if (isCorrect) {
      onCorrectAnswer();
    }
  };

  const handleNext = () => {
    setIsSubmitted(false);
    setSelectedAnswer(null);
    if (quiz) {
        setCurrentQuestionIndex((prev) => (prev + 1) % quiz.questions.length);
    }
  };
  
  if (isLoading) {
    return (
        <div className="flex flex-col h-full space-y-4">
             <div>
                <h3 className="text-lg font-semibold"><Skeleton className="h-6 w-48" /></h3>
                <p className="text-sm text-muted-foreground"><Skeleton className="h-4 w-64 mt-1" /></p>
            </div>
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle className="text-base"><Skeleton className="h-5 w-full" /></CardTitle>
                    <CardDescription><Skeleton className="h-4 w-3/4" /></CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-1/2" />
                </CardContent>
                 <CardFooter>
                    <Button disabled className="w-full">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Quiz...
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
  }
  
  if (error) {
    return <div className="text-destructive text-center py-10">{error}</div>
  }
  
  if (!quiz || !currentQuestion) {
    return (
        <div className="text-muted-foreground text-center py-10">
            No quiz available for this file.
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-4">
       <div>
        <h3 className="text-lg font-semibold">{quiz.title}</h3>
        <p className="text-sm text-muted-foreground">Test your knowledge about {fileName}.</p>
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-base">{currentQuestion.question}</CardTitle>
          <CardDescription>Select one of the options below.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            onValueChange={setSelectedAnswer}
            value={selectedAnswer || ""}
            disabled={isSubmitted}
          >
            {currentQuestion.options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className={cn(
                  "cursor-pointer",
                  isSubmitted && option === currentQuestion.correctAnswer && "text-green-600 font-bold",
                  isSubmitted && option !== currentQuestion.correctAnswer && option === selectedAnswer && "text-red-600 line-through"
                )}>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          {isSubmitted && (
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-md w-full mb-4",
              isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}>
              {isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <p className="font-medium">{isCorrect ? "Correct!" : `Not quite. The correct answer is: ${currentQuestion.correctAnswer}`}</p>
            </div>
          )}
          {isSubmitted ? (
             <Button onClick={handleNext} className="w-full">
              Next Question
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!selectedAnswer} className="w-full">
              Submit
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
