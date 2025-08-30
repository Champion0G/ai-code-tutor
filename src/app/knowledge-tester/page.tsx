
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, TestTube, Award, ArrowUp, ArrowDown, Repeat } from 'lucide-react';
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
        addXp(10);
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
      const percentage = (finalScore / totalQuestions) * 100;
      if (percentage >= 90) addBadge("Expert_Learner");
  }

  const getNextDifficulty = (up: boolean): QuizDifficulty | null => {
      const currentIndex = difficultyLevels.indexOf(currentDifficulty);
      const nextIndex = up ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex >= 0 && nextIndex < difficultyLevels.length) {
          return difficultyLevels[nextIndex];
      }
      return null;
  }

  const renderAdaptiveButtons = () => {
      if (!quizScore) return null;

      const percentage = (quizScore.score / quizScore.total) * 100;
      const canGoUp = percentage >= 80 && getNextDifficulty(true);
      const canGoDown = percentage < 50 && getNextDifficulty(false);

      return (
         <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => handleGenerateTest(currentDifficulty)}>
                <Repeat className="mr-2 h-4 w-4" />
                Try Same Level Again
            </Button>
            {canGoUp && (
                <Button size="sm" variant="success" onClick={() => handleGenerateTest(canGoUp)}>
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Advance to {canGoUp.split(' ')[0]}
                </Button>
            )}
            {canGoDown && (
                <Button size="sm" variant="secondary" onClick={() => handleGenerateTest(canGoDown)}>
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Review on {canGoDown.split(' ')[0]}
                </Button>
            )}
        </div>
      )
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

          {quiz && !quizScore && (
            <QuizView
                key={quizKey}
                quiz={quiz}
                onCorrectAnswer={handleCorrectAnswer}
                onQuizComplete={handleQuizCompletion}
            />
          )}

          {quizScore && (
                <Alert variant="default" className="border-primary">
                    <Award className="h-4 w-4" />
                    <AlertTitle>Quiz Result</AlertTitle>
                    <AlertDescription>
                        You scored {quizScore.score} out of {quizScore.total}. {quizScore.score / quizScore.total >= 0.8 ? "Great job!" : "Keep practicing!"}
                        {renderAdaptiveButtons()}
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
