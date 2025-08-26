
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenerateQuizOutput } from "@/ai/flows/generate-quiz";

interface QuizViewProps {
  quiz: GenerateQuizOutput;
  onCorrectAnswer: () => void;
}

export function QuizView({ quiz, onCorrectAnswer }: QuizViewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string | null>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestionIndex = Object.keys(submittedAnswers).length;
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
      onCorrectAnswer();
    }
    
    setSubmittedAnswers(prev => ({ ...prev, [currentQuestionIndex]: true }));

    if (currentQuestionIndex === quiz.questions.length - 1) {
        setIsFinished(true);
    }
  };
  
  const handleRestart = () => {
      setSelectedAnswers({});
      setSubmittedAnswers({});
      setScore(0);
      setIsFinished(false);
  }

  if (isFinished) {
      return (
          <Card className="text-center">
              <CardHeader>
                  <CardTitle>Quiz Complete!</CardTitle>
                  <CardDescription>You've completed the quiz for "{quiz.title}".</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">{score} / {quiz.questions.length}</p>
                  <p className="text-muted-foreground">Your Score</p>
              </CardContent>
              <CardFooter>
                  <Button onClick={handleRestart} className="w-full">
                    Try Again
                  </Button>
              </CardFooter>
          </Card>
      )
  }

  if (!currentQuestion) {
      return (
           <div className="text-muted-foreground text-center py-10">
              Something went wrong, no more questions.
          </div>
      )
  }
  
  const isSubmitted = submittedAnswers[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base leading-relaxed">{currentQuestionIndex + 1}. {currentQuestion.question}</CardTitle>
        <CardDescription>Select one of the options below. ({currentQuestionIndex + 1}/{quiz.questions.length})</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          onValueChange={(value) => setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }))}
          value={selectedAnswer || ""}
          disabled={isSubmitted}
        >
          {currentQuestion.options.map((option) => (
            <Label
              key={option}
              className={cn(
                "flex items-center gap-4 rounded-lg border p-3 cursor-pointer transition-all hover:bg-muted/50",
                 isSubmitted && option === currentQuestion.correctAnswer && "border-green-500 bg-green-500/10",
                 isSubmitted && option !== currentQuestion.correctAnswer && selectedAnswer === option && "border-red-500 bg-red-500/10",
              )}
            >
              <RadioGroupItem value={option} id={`${currentQuestionIndex}-${option}`} />
              <span>{option}</span>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        {isSubmitted && (
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-md w-full mb-4 text-sm",
            isCorrect ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
          )}>
            {isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <p className="font-medium">{isCorrect ? "Correct!" : `Not quite. The correct answer is: ${currentQuestion.correctAnswer}`}</p>
          </div>
        )}
        <Button onClick={handleSubmit} disabled={!selectedAnswer} className="w-full">
            {isSubmitted ? 'Next Question' : 'Submit'}
        </Button>
      </CardFooter>
    </Card>
  );
}
