
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BookOpen, ChevronLeft, Loader2, WandSparkles, Sparkles, Brain, HelpCircle, Lightbulb } from 'lucide-react';
import { generateLesson } from '@/ai/flows/generate-lesson';
import { explainTopicFurther, ExplainTopicFurtherOutput } from '@/ai/flows/explain-topic-further';
import type { GenerateLessonOutput } from '@/models/lesson';
import { generateQuiz, GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { answerTopicQuestion } from '@/ai/flows/answer-topic-question';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';
import { QuizView } from '@/components/quiz-view';
import { useGamification } from '@/contexts/gamification-context';
import { Separator } from '@/components/ui/separator';

function TutorView() {
  const [topic, setTopic] = useState('');
  const [lesson, setLesson] = useState<GenerateLessonOutput | null>(null);
  const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
  const [furtherExplanation, setFurtherExplanation] = useState<ExplainTopicFurtherOutput | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [questionAnswer, setQuestionAnswer] = useState<string | null>(null);

  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);

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
    setFurtherExplanation(null);
    setQuestionAnswer(null);
    setUserQuestion('');

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
          const lessonContent = `Title: ${lesson.title}\\nIntroduction: ${lesson.introduction}\\n${lesson.keyConcepts.map(c => `Concept: ${c.title}\\n${c.explanation}`).join('\\n\\n')}\\nConclusion: ${lesson.conclusion}`;
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

  const handleExplainFurther = async () => {
    if (!lesson) return;
    setIsLoadingExplanation(true);
    setError(null);
    try {
      const result = await explainTopicFurther({ lesson });
      setFurtherExplanation(result);
    } catch (e) {
      setError('Failed to generate further explanation. Please try again.');
      console.error(e);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!lesson || !userQuestion) return;
    setIsLoadingAnswer(true);
    setError(null);
    setQuestionAnswer(null);
    try {
      const lessonContent = `Title: ${lesson.title}\\nIntroduction: ${lesson.introduction}\\n${lesson.keyConcepts.map(c => `Concept: ${c.title}\\n${c.explanation}`).join('\\n\\n')}\\nConclusion: ${lesson.conclusion}`;
      const result = await answerTopicQuestion({ lessonContent, userQuestion });
      setQuestionAnswer(result.answer);
    } catch (e) {
      setError('Failed to get an answer. Please try again.');
      console.error(e);
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  const handleCorrectAnswer = () => {
      addXp(20);
      addBadge('Quiz_Whiz');
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
              <CardTitle className="text-2xl">What would you like to learn?</CardTitle>
              <CardDescription>Enter a programming topic, concept, or language feature below.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleGenerateLesson(); }} className="flex flex-col sm:flex-row gap-2">
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
            <Card className="p-6">
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
            </Card>
          )}

          {lesson && (
            <Card>
                <CardContent className="p-6">
                    <article className="prose prose-lg max-w-none dark:prose-invert">
                        <h1>{lesson.title}</h1>
                        <p className="lead">{lesson.introduction}</p>
                        {lesson.keyConcepts.map((concept, index) => (
                            <div key={index}>
                                <h2>{concept.title}</h2>
                                <p>{concept.explanation}</p>
                                {concept.codeExample && (
                                    <div className="my-4">
                                        <pre className="p-4 text-sm font-code bg-muted rounded-md overflow-x-auto"><code>{concept.codeExample}</code></pre>
                                        {concept.codeExplanation && <p className="text-sm italic text-muted-foreground mt-2">{concept.codeExplanation}</p>}
                                    </div>
                                )}
                            </div>
                        ))}
                        <h2>Conclusion</h2>
                        <p>{lesson.conclusion}</p>
                    </article>

                    <Separator className='my-8' />

                    <div className="space-y-6">
                      {furtherExplanation && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight text-center">{furtherExplanation.title}</h2>
                            <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto">{furtherExplanation.introduction}</p>
                            <div className="grid gap-6">
                                {furtherExplanation.sections.map((section, index) => (
                                    <Card key={index} className="bg-muted/50">
                                        <CardHeader>
                                            <CardTitle className="text-xl flex items-center gap-3"><Brain className="h-6 w-6 text-primary" /> {section.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="prose prose-base max-w-none dark:prose-invert whitespace-pre-wrap">{section.content}</div>
                                            {section.analogy && (
                                                <div className="p-4 bg-background/50 rounded-lg border border-dashed border-accent">
                                                    <p className="flex items-start gap-3">
                                                        <Lightbulb className="h-5 w-5 text-accent mt-1 shrink-0" />
                                                        <span className="flex-1 text-sm italic"><strong className='not-italic'>Analogy:</strong> {section.analogy}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <p className="text-center text-muted-foreground">{furtherExplanation.conclusion}</p>
                        </div>
                      )}

                      <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Still Curious?</CardTitle>
                            <CardDescription>Use the options below to explore the topic further.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Button onClick={handleExplainFurther} disabled={isLoadingExplanation} className="w-full">
                            {isLoadingExplanation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                            {isLoadingExplanation ? 'Expanding...' : 'Explain Further'}
                          </Button>
                          
                          <form onSubmit={(e) => {e.preventDefault(); handleAskQuestion(); }} className="space-y-2">
                             <label htmlFor="user-question">Ask a specific question</label>
                             <Textarea
                                id="user-question"
                                placeholder="e.g., 'What's the difference between let and var in this context?'"
                                value={userQuestion}
                                onChange={(e) => setUserQuestion(e.target.value)}
                                disabled={isLoadingAnswer}
                             />
                             <Button type="submit" disabled={isLoadingAnswer || !userQuestion} className="w-full">
                               {isLoadingAnswer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HelpCircle className="mr-2 h-4 w-4" />}
                               {isLoadingAnswer ? 'Thinking...' : 'Get Answer'}
                             </Button>
                          </form>
                          {isLoadingAnswer && <Skeleton className="h-16 w-full" />}
                          {questionAnswer && (
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <div className="prose prose-base max-w-none dark:prose-invert whitespace-pre-wrap">{questionAnswer}</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

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
                    </div>
                </CardContent>
            </Card>
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

    
