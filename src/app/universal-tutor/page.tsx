
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, WandSparkles } from 'lucide-react';
import { Header } from '@/components/header';
import { generateUniversalLesson } from '@/ai/flows/generate-universal-lesson';
import type { UniversalLesson } from '@/models/universal-lesson';
import { Skeleton } from '@/components/ui/skeleton';

function UniversalTutorView() {
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState<UniversalLesson | null>(null);
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
      const result = await generateUniversalLesson({ topic });
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
              <CardTitle className="text-2xl">Universal AI Tutor</CardTitle>
              <CardDescription>Enter any topic you want to learn about, from calculus to ancient history.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleGenerateLesson(); }} className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="e.g., 'The Water Cycle', 'Python for web dev', 'World War II'"
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
            <Card className="p-6">
                <div className="space-y-6">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </div>
            </Card>
          )}

          {lesson && (
            <Card>
                <CardContent className="p-6">
                    <article className="prose prose-lg max-w-none dark:prose-invert">
                        <h1>{lesson.title}</h1>
                        <p className="lead">{lesson.introduction.analogy}</p>

                        <h2>Step-by-Step Breakdown</h2>
                        <ol>
                           {lesson.stepByStep.map((step, index) => (
                               <li key={index}>
                                   <strong>{step.title}:</strong> {step.content}
                               </li>
                           ))}
                        </ol>

                        <h2>Real-World Application</h2>
                        <p>{lesson.realWorldApplication}</p>

                        <h2>Summary</h2>
                        <p>{lesson.summary}</p>
                    </article>
                </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}


export default function UniversalTutorPage() {
  return (
    <UniversalTutorView />
  )
}
