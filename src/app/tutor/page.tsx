
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ChevronLeft, Loader2, WandSparkles } from 'lucide-react';
import { generateLesson, GenerateLessonOutput } from '@/ai/flows/generate-lesson';
import { Skeleton } from '@/components/ui/skeleton';
import { GamificationProvider } from '@/contexts/gamification-context';
import { Header } from '@/components/header';

function TutorView() {
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState<GenerateLessonOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLesson = async () => {
    if (!topic) {
      setError('Please enter a topic to learn.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLesson(null);

    try {
      const result = await generateLesson({ topic });
      setLesson(result);
    } catch (e) {
      setError('Failed to generate lesson. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What would you like to learn?</CardTitle>
              <CardDescription>Enter a programming topic, concept, or language feature below.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleGenerateLesson(); }} className="flex gap-2">
                <Input
                  placeholder="e.g., 'React Hooks', 'Python decorators', 'CSS Flexbox'"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !topic}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Generating...' : 'Teach Me'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && <div className="text-destructive text-center py-10">{error}</div>}

          {isLoading && (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                </div>
                 <div className="space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
          )}

          {lesson && (
            <article className="prose prose-lg max-w-none dark:prose-invert">
                <h1>{lesson.title}</h1>
                <p className="lead">{lesson.introduction}</p>
                {lesson.keyConcepts.map((concept, index) => (
                    <div key={index}>
                        <h2>{concept.title}</h2>
                        <p>{concept.explanation}</p>
                    </div>
                ))}
                <h2>Conclusion</h2>
                <p>{lesson.conclusion}</p>
            </article>
          )}
        </div>
      </main>
    </div>
  );
}


export default function TutorPage() {
  return (
    <GamificationProvider>
      <TutorView />
    </GamificationProvider>
  )
}
