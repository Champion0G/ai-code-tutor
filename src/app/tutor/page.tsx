
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ChevronLeft, Loader2, WandSparkles, Sparkles } from 'lucide-react';
import { generateLesson, GenerateLessonOutput } from '@/ai/flows/generate-lesson';
import { generateQuiz, GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';
import { QuizView } from '@/components/quiz-view';
import { useGamification } from '@/contexts/gamification-context';
import { Separator } from '@/components/ui/separator';

function TutorView() {
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState<GenerateLessonOutput | null>(null);
  const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizKey, setQuizKey] = useState(0);

  const { addXp, addBadge } = useGamification();

  const handleGenerateLesson = async () => {
    if (!topic) {
      setError('Please enter a topic to learn.');
      return;
    }

    setIsLoadingLesson(true);
    setError(null);
    setLesson(null);
    setQuiz(null);

    try {
      const result = await generateLesson({ topic });
      setLesson(result);
    } catch (e) {
      setError('Failed to generate lesson. Please try again.');
      console.error(e);
    } finally {
      setIsLoadingLesson(false);
    }
  };
  
  const handleGenerateQuiz = async () => {
      if (!lesson) return;
      
      setIsLoadingQuiz(true);
      setError(null);
      setQuiz(null);
      
      try {
          const lessonContent = `Title: ${lesson.title}\nIntroduction: ${lesson.introduction}\n${lesson.keyConcepts.map(c => `Concept: ${c.title}\n${c.explanation}`).join('\n\n')}\nConclusion: ${lesson.conclusion}`;
          const result = await generateQuiz({ fileContent: lessonContent, fileName: lesson.title });
          setQuiz(result);
          setQuizKey(prev => prev + 1); // Force re-render of QuizView
      } catch(e) {
          setError('Failed to generate quiz. Please try again.');
          console.error(e);
      } finally {
          setIsLoadingQuiz(false);
      }
  };

  const handleCorrectAnswer = () => {
      addXp(20);
      addBadge('Quiz_Whiz');
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header showSidebarTrigger={false} />
      <main className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className='mb-4 inline-block'>
              <Button variant="outline" size="sm">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Mode Selection
              </Button>
          </Link>
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
                  disabled={isLoadingLesson}
                />
                <Button type="submit" disabled={isLoadingLesson || !topic}>
                  {isLoadingLesson ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
                  {isLoadingLesson ? 'Generating...' : 'Teach Me'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && <div className="text-destructive text-center py-10">{error}</div>}

          {isLoadingLesson && (
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
            <>
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

                <Separator className='my-8' />

                {quiz ? (
                     <QuizView key={quizKey} quiz={quiz} onCorrectAnswer={handleCorrectAnswer} />
                ) : (
                    <div className='text-center'>
                         <Button onClick={handleGenerateQuiz} disabled={isLoadingQuiz} size="lg">
                            {isLoadingQuiz ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                            {isLoadingQuiz ? 'Generating Quiz...' : 'Test Your Knowledge!'}
                        </Button>
                    </div>
                )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}


export default function TutorPage() {
  return (
    <TutorView />
  )
}
