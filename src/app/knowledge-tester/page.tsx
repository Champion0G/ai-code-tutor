
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, TestTube, Award } from 'lucide-react';
import { Header } from '@/components/header';
import { useGamification } from '@/contexts/gamification-context';
import { generateAdaptiveQuizAction } from '@/app/actions/generate-adaptive-quiz-action';
import type { GenerateAdaptiveQuizOutput, QuizDifficulty } from '@/models/adaptive-quiz';
import { QuizView } from '@/components/quiz-view';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const difficultyLevels: QuizDifficulty[] = [
    "Beginner (Recall)",
    "Intermediate (Apply)",
    "Advanced (Analyze)",
    "Expert (Create/Evaluate)"
];

function KnowledgeTesterView() {
  const [topic, setTopic] = useState('');
  const [currentDifficulty, setCurrentDifficulty] = useState<QuizDifficulty>("Intermediate (Apply)");
  const [quiz, setQuiz] = useState<GenerateAdaptiveQuizOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<{ score: number, total: number } | null>(null);
  const [quizKey, setQuizKey] = useState(0);


  const { addXp, addBadge, checkAndIncrementUsage } = useGamification();

  const handleGenerateTest = async (difficulty: QuizDifficulty) => {
    if (!topic) {
      setError('Please enter a topic to be tested on.');
      return;
    }

    const canProceed = await checkAndIncrementUsage();
    if (!canProceed) {
        setError("You have reached your daily AI usage limit.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setQuiz(null);
    setQuizScore(null);
    setCurrentDifficulty(difficulty);

    try {
      const result = await generateAdaptiveQuizAction({ topic, difficulty });
      if (result.success && result.quiz) {
        setQuiz(result.quiz);
        setQuizKey(prev => prev + 1); // Force re-mount of QuizView
      } else {
        throw new Error(result.message || "Failed to generate the test.");
      }
    } catch (e: any) {
      setError(e.message);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCorrectAnswer = () => {
    addXp(25);
    addBadge("Quiz_Whiz");
  }

  const handleQuizCompletion = (finalScore: number, totalQuestions: number) => {
      setQuizScore({ score: finalScore, total: totalQuestions });
      // In the next step, we'll add logic here to adapt the difficulty.
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header showSidebarTrigger={false} />
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link href="/" className='inline-block'>
              <Button variant="outline" size="sm">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Mode Selection
              </Button>
          </Link>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Test Your Knowledge</CardTitle>
              <CardDescription>
                Enter a topic to generate an adaptive test that challenges you at your skill level.
                Tests start at an intermediate level and adjust based on your performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleGenerateTest("Intermediate (Apply)"); }} className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="e.g., 'React State Management', 'Cybersecurity Fundamentals'"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !topic}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Generating Test...' : 'Start Test'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && <div className="text-destructive text-center py-10">{error}</div>}

          {isLoading && (
            <div className='text-center py-10'>
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground mt-2">Generating your {currentDifficulty.split(' ')[0]} level test...</p>
            </div>
          )}

          {quiz && (
            <QuizView
                key={quizKey}
                quiz={quiz}
                onCorrectAnswer={handleCorrectAnswer}
                onQuizComplete={handleQuizCompletion}
            />
          )}

          {quizScore && !isLoading && (
                <Alert variant="default" className="border-primary">
                    <Award className="h-4 w-4" />
                    <AlertTitle>Quiz Result</AlertTitle>
                    <AlertDescription>
                        You scored {quizScore.score} out of {quizScore.total}. {quizScore.score / quizScore.total > 0.7 ? "Great job!" : "Keep practicing!"}
                        <div className="mt-4 flex gap-2">
                            <Button size="sm" onClick={() => handleGenerateTest(currentDifficulty)}>Try Same Level Again</Button>
                            {/* We will add adaptive buttons here in the next step */}
                        </div>
                    </AlertDescription>
                </Alert>
          )}

        </div>
      </main>
    </div>
  );
}


export default function KnowledgeTesterPage() {
    return <KnowledgeTesterView />
}
