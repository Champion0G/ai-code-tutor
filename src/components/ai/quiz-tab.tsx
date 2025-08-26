"use client";

import { useState, useMemo } from "react";
import { quizzes } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizTabProps {
  fileName: string;
  onCorrectAnswer: () => void;
}

export function QuizTab({ fileName, onCorrectAnswer }: QuizTabProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const quiz = useMemo(() => {
    const fileKey = fileName.split('.')[0] as keyof typeof quizzes;
    return quizzes[fileKey] || quizzes.default;
  }, [fileName]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);
    if (selectedAnswer === currentQuestion.correctAnswer) {
      onCorrectAnswer();
    }
  };

  const handleNext = () => {
    setIsSubmitted(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex((prev) => (prev + 1) % quiz.questions.length);
  };
  
  if (!quiz) {
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
                  isSubmitted && option === currentQuestion.correctAnswer && "text-green-600",
                  isSubmitted && option !== currentQuestion.correctAnswer && option === selectedAnswer && "text-red-600"
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
              <p className="font-medium">{isCorrect ? "Correct!" : "Not quite. The correct answer is highlighted."}</p>
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
