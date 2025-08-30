
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenerateQuizOutput } from "@/ai/flows/generate-quiz";
import type { GenerateAdaptiveQuizOutput } from "@/models/adaptive-quiz";
import { Textarea } from "./ui/textarea";

type AnyQuiz = GenerateQuizOutput | GenerateAdaptiveQuizOutput;

interface QuizViewProps {
  quiz: AnyQuiz;
  onCorrectAnswer: () => void;
  onQuizComplete?: (score: number, totalQuestions: number) => void;
}

export function QuizView({ quiz, onCorrectAnswer, onQuizComplete }: QuizViewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string | boolean | null>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestionIndex = Object.keys(submittedAnswers).length;
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  const handleSubmit = () => {
    if (selectedAnswer === undefined || selectedAnswer === null || !currentQuestion) return;

    let isCorrect = false;
    if (currentQuestion.type === 'mcq' || currentQuestion.type === 'true-false') {
        isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    } else {
        // For short-answer, we can just mark as correct for now for XP.
        // A more advanced version could use AI for grading.
        isCorrect = true; 
    }

    if (isCorrect) {
      setScore(s => s + 1);
      onCorrectAnswer();
    }
    
    setSubmittedAnswers(prev => ({ ...prev, [currentQuestionIndex]: true }));

    if (currentQuestionIndex === quiz.questions.length - 1) {
        setIsFinished(true);
        const finalScore = isCorrect ? score + 1 : score;
        onQuizComplete?.(finalScore, quiz.questions.length);
    }
  };
  
  const handleRestart = () => {
      setSelectedAnswers({});
      setSubmittedAnswers({});
      setScore(0);
      setIsFinished(false);
      onQuizComplete?.(0, 0); // Reset score in parent
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
              Quiz finished or no questions available.
          </div>
      )
  }
  
  const isSubmitted = submittedAnswers[currentQuestionIndex];
  
  const renderQuestionBody = () => {
      switch (currentQuestion.type) {
          case 'mcq':
            return (
                <RadioGroup
                    onValueChange={(value) => setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }))}
                    value={selectedAnswer as string || ""}
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
            )
          case 'true-false':
            return (
                <RadioGroup
                    onValueChange={(value) => setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: value === 'true' }))}
                    value={typeof selectedAnswer === 'boolean' ? String(selectedAnswer) : ""}
                    disabled={isSubmitted}
                    className="flex gap-4"
                    >
                     <Label className={cn("flex-1 flex items-center gap-4 rounded-lg border p-3 cursor-pointer transition-all hover:bg-muted/50", isSubmitted && currentQuestion.correctAnswer === true && "border-green-500 bg-green-500/10", isSubmitted && selectedAnswer === true && currentQuestion.correctAnswer === false && "border-red-500 bg-red-500/10")}>
                        <RadioGroupItem value="true" id={`${currentQuestionIndex}-true`} /> True
                    </Label>
                    <Label className={cn("flex-1 flex items-center gap-4 rounded-lg border p-3 cursor-pointer transition-all hover:bg-muted/50", isSubmitted && currentQuestion.correctAnswer === false && "border-green-500 bg-green-500/10", isSubmitted && selectedAnswer === false && currentQuestion.correctAnswer === true && "border-red-500 bg-red-500/10")}>
                        <RadioGroupItem value="false" id={`${currentQuestionIndex}-false`} /> False
                    </Label>
                </RadioGroup>
            )
          case 'short-answer':
            return (
                <Textarea 
                    placeholder="Type your answer here..."
                    rows={4}
                    onChange={(e) => setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: e.target.value }))}
                    value={selectedAnswer as string || ""}
                    disabled={isSubmitted}
                />
            )
          default:
              // This should not happen with the union type, but it's good practice
              const exhaustiveCheck: never = currentQuestion;
              return null;
      }
  }

  const renderFeedback = () => {
    if (!isSubmitted) return null;

    let isCorrect = false;
    let correctAnswerText = '';

    if (currentQuestion.type === 'mcq' || currentQuestion.type === 'true-false') {
        isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        correctAnswerText = `The correct answer is: ${String(currentQuestion.correctAnswer)}`;
    } else {
        isCorrect = true; // Auto-correct for now
        correctAnswerText = `Ideal Answer: ${currentQuestion.idealAnswer}`;
    }

    return (
         <div className={cn(
            "flex items-start gap-2 p-2 rounded-md w-full mb-4 text-sm",
            isCorrect ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
          )}>
            {isCorrect ? <CheckCircle className="h-5 w-5 mt-0.5" /> : <XCircle className="h-5 w-5 mt-0.5" />}
            <p className="font-medium flex-1">{isCorrect ? (currentQuestion.type === 'short-answer' ? correctAnswerText : "Correct!") : correctAnswerText}</p>
          </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base leading-relaxed">{currentQuestionIndex + 1}. {currentQuestion.question}</CardTitle>
        <CardDescription>
            Select one of the options below. ({currentQuestionIndex + 1}/{quiz.questions.length})
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">{currentQuestion.type.replace('-', ' ')}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderQuestionBody()}
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        {renderFeedback()}
        <Button onClick={handleSubmit} disabled={selectedAnswer === null || selectedAnswer === undefined || selectedAnswer === ''} className="w-full">
            {isSubmitted ? 'Next Question' : 'Submit'}
        </Button>
      </CardFooter>
    </Card>
  );
}
