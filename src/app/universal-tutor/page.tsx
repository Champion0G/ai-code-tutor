
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, WandSparkles, BookCopy, Sparkles } from 'lucide-react';
import { Header } from '@/components/header';
import { generateUniversalLesson } from '@/ai/flows/generate-universal-lesson';
import type { UniversalLesson } from '@/models/universal-lesson';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { generateQuiz, GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { QuizView } from '@/components/quiz-view';
import { useGamification } from '@/contexts/gamification-context';
import Chatbot from '@/components/chatbot';

function UniversalTutorView() {
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState<UniversalLesson | null>(null);
  const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizKey, setQuizKey] = useState(0);
  const { addXp, addBadge } = useGamification();

  const handleGenerateLesson = async () => {
    if (!topic) {
      setError('Please enter a topic to learn.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLesson(null);
    setQuiz(null);

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

  const handleGenerateQuiz = async () => {
      if (!lesson) return;
      
      setIsLoadingQuiz(true);
      setError(null);
      setQuiz(null);
      
      try {
          const lessonContent = `Title: ${lesson.title}\\nIntroduction: ${lesson.introduction.analogy}\\n${lesson.stepByStep.map(s => `Step: ${s.title}\\n${s.content}`).join('\\n\\n')}\\nConclusion: ${lesson.summary}`;
          const result = await generateQuiz({ fileContent: lessonContent, fileName: lesson.title });
          setQuiz(result);
          setQuizKey(prev => prev + 1);
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

  const lessonContentForContext = lesson ? 
    `Title: ${lesson.title}\nIntroduction: ${lesson.introduction.analogy}\n` +
    lesson.stepByStep.map(s => `Step: ${s.title}\n${s.content}`).join('\n\n') +
    `\nDeep Dive: ${lesson.deepDive.title}\n${lesson.deepDive.content}` +
    `\nReal World Application: ${lesson.realWorldApplication}` +
    `\nConclusion: ${lesson.summary}`
    : "";


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
                <CardContent className="p-6 space-y-8">
                    <article className="prose prose-lg max-w-none dark:prose-invert">
                        <h1>{lesson.title}</h1>
                        <p className="lead border-l-4 border-accent pl-4 italic">{lesson.introduction.analogy}</p>

                        <h2>Step-by-Step Breakdown</h2>
                        <ol>
                           {lesson.stepByStep.map((step, index) => (
                               <li key={index} className='mb-2'>
                                   <strong className='font-semibold'>{step.title}:</strong> {step.content}
                               </li>
                           ))}
                        </ol>
                        
                        <h2>Real-World Application</h2>
                        <p>{lesson.realWorldApplication}</p>

                        <h2>Summary</h2>
                        <p>{lesson.summary}</p>
                    </article>

                    <Separator />

                    <Card className='bg-muted/50'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-3 text-xl'>
                                <BookCopy className='h-6 w-6 text-primary' />
                                {lesson.deepDive.title}
                            </CardTitle>
                             <CardDescription>
                                A more detailed, academic look into the topic.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='prose prose-base max-w-none dark:prose-invert whitespace-pre-wrap'>
                                {lesson.deepDive.content}
                            </div>
                            {lesson.deepDive.references && lesson.deepDive.references.length > 0 && (
                                <>
                                    <h4 className='font-semibold mt-6 mb-2'>References</h4>
                                    <ul className='list-disc list-inside text-sm space-y-1'>
                                        {lesson.deepDive.references.map((ref, i) => <li key={i}>{ref}</li>)}
                                    </ul>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Separator />

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
                </CardContent>
            </Card>
          )}
        </div>
      </main>
      {lesson && <Chatbot lessonContext={lessonContentForContext} />}
    </div>
  );
}


export default function UniversalTutorPage() {
  return (
    <UniversalTutorView />
  )
}
