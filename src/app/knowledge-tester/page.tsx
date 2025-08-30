
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, TestTube, Award, ArrowUp, ArrowDown, Repeat, Zap, UserCheck, BrainCircuit, Activity } from 'lucide-react';
import { Header } from '@/components/header';
import { useGamification } from '@/contexts/gamification-context';
import { generateAdaptiveQuizAction } from '@/app/actions/generate-adaptive-quiz-action';
import type { GenerateAdaptiveQuizOutput, QuizDifficulty } from '@/models/adaptive-quiz';
import { QuizView } from '@/components/quiz-view';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const difficultyLevels: QuizDifficulty[] = [
    "Beginner (Recall)",
    "Intermediate (Apply)",
    "Advanced (Analyze)",
    "Expert (Create/Evaluate)"
];

function KnowledgeTesterView() {
  const [topic, setTopic] = useState('');
  const [currentDifficulty, setCurrentDifficulty] = useState<QuizDifficulty>("Beginner (Recall)");
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
      if (!quizScore || quizScore.total === 0) return null;

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
          
          {!quiz ? (
            <>
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4 mb-2">
                            <TestTube className="h-8 w-8 text-primary" />
                            <CardTitle className="text-2xl font-headline">Test Your Knowledge</CardTitle>
                        </div>
                        <CardDescription>
                            Challenge yourself with adaptive quizzes on any topic. Progress through difficulty levels and master subjects.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => { e.preventDefault(); handleGenerateTest(currentDifficulty); }} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="topic-input" className="text-sm font-medium">Topic</label>
                                <Input
                                id="topic-input"
                                placeholder="e.g., 'JavaScript Promises', 'Machine Learning', 'Database Design'"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                disabled={isLoading}
                                />
                            </div>
                             <div className="space-y-2">
                                <label htmlFor="difficulty-select" className="text-sm font-medium">Difficulty Level</label>
                                <Select onValueChange={(value: QuizDifficulty) => setCurrentDifficulty(value)} defaultValue={currentDifficulty} disabled={isLoading}>
                                    <SelectTrigger id="difficulty-select">
                                        <SelectValue placeholder="Select a difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {difficultyLevels.map(level => (
                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" variant="success" className='w-full' size="lg" disabled={isLoading || !topic}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                                {isLoading ? 'Generating Test...' : 'Start Test'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <BrainCircuit className="h-6 w-6 text-primary" />
                            How It Works
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div className="flex items-start gap-3">
                            <Zap className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <h4 className="font-semibold">Adaptive Testing</h4>
                                <p className="text-muted-foreground">Questions adapt to your performance. Score well to unlock harder levels.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Activity className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <h4 className="font-semibold">Multiple Question Types</h4>
                                <p className="text-muted-foreground">MCQs, true/false, short answers, and scenario-based questions.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Award className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <h4 className="font-semibold">Progress Tracking</h4>
                                <p className="text-muted-foreground">Track your mastery level and earn XP for each successful test.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <UserCheck className="h-5 w-5 text-primary mt-1" />
                            <div>
                                <h4 className="font-semibold">Expert Certification</h4>
                                <p className="text-muted-foreground">Reach expert level to prove your mastery of the topic.</p>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            </>
          ) : null }

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
                    <AlertTitle>Quiz Result: {quizScore.score} / {quizScore.total}</AlertTitle>
                    <AlertDescription>
                        {quizScore.score / quizScore.total >= 0.8 ? "Great job! You're ready for a bigger challenge." : "Good effort! Review the material and try again."}
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
