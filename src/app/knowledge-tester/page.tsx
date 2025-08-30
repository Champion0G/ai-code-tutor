
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, TestTube } from 'lucide-react';
import { Header } from '@/components/header';
import { useGamification } from '@/contexts/gamification-context';
import { generateAdaptiveQuizAction } from '@/app/actions/generate-adaptive-quiz-action';
import type { GenerateAdaptiveQuizOutput, QuizDifficulty } from '@/ai/flows/generate-adaptive-quiz';

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
    setCurrentDifficulty(difficulty);

    try {
      const result = await generateAdaptiveQuizAction({ topic, difficulty });
      if (result.success && result.quiz) {
        setQuiz(result.quiz);
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
              <form onSubmit={(e) => { e.preventDefault(); handleGenerateTest(currentDifficulty); }} className="flex flex-col sm:flex-row gap-2">
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
            <div className='text-center'>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground mt-2">Generating your test for: {currentDifficulty}</p>
            </div>
          )}

          {quiz && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-4">{quiz.title}</h2>
              <p className="text-center text-muted-foreground mb-8">
                This is a placeholder for the adaptive quiz view. We will build this next.
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{JSON.stringify(quiz, null, 2)}</code>
              </pre>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}


export default function KnowledgeTesterPage() {
    return <KnowledgeTesterView />
}
