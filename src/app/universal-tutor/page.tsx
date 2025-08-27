
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, WandSparkles, BookCopy, Sparkles, CheckCircle, Lightbulb, Brain, Award, Drama } from 'lucide-react';
import { Header } from '@/components/header';
import type { UniversalLesson } from '@/models/universal-lesson';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { QuizView } from '@/components/quiz-view';
import { useGamification } from '@/contexts/gamification-context';
import Chatbot from '@/components/chatbot';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { generateLessonAction } from '@/app/actions/generate-lesson-action';
import { generateQuizAction } from '@/app/actions/generate-quiz-action';
import { getFeedbackOnSummaryAction } from '@/app/actions/get-feedback-on-summary-action';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { answerTopicQuestionAction } from '@/app/actions/answer-topic-question-action';
import { explainTopicFurtherAction } from '@/app/actions/explain-topic-further-action';


import type { ExplainTopicFurtherOutput } from '@/ai/flows/explain-topic-further';

type KnowledgeLevel = "beginner" | "intermediate" | "advanced";

function UniversalTutorView() {
  const [topic, setTopic] = useState('');
  const [knowledgeLevel, setKnowledgeLevel] = useState<KnowledgeLevel>("beginner");
  const [lesson, setLesson] = useState<UniversalLesson | null>(null);
  const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
  const [furtherExplanation, setFurtherExplanation] = useState<ExplainTopicFurtherOutput | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [quizKey, setQuizKey] = useState(0);
  const { addXp, addBadge } = useGamification();

  const [userSummary, setUserSummary] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const [quizScore, setQuizScore] = useState<{ score: number, total: number } | null>(null);


  const getLessonAsText = (currentLesson: UniversalLesson | null): string => {
    if (!currentLesson) return "";
    return `
      Title: ${currentLesson.title}.
      Introduction: Use this analogy: ${currentLesson.introduction.analogy}.
      Let's break it down step-by-step. ${currentLesson.stepByStep.map((s, i) => `Step ${i+1}: ${s.title}. ${s.content}`).join(' ')}
      Now for a deeper academic explanation. ${currentLesson.deepDive.title}. ${currentLesson.deepDive.content}.
      Here is a real world application. ${currentLesson.realWorldApplication}.
      To summarize: ${currentLesson.summary}.
    `;
  }

  const handleGenerateLesson = async () => {
    if (!topic) {
      setError('Please enter a topic to learn.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLesson(null);
    setQuiz(null);
    setFeedback(null);
    setUserSummary("");
    setFurtherExplanation(null);
    setQuizScore(null);

    try {
      const result = await generateLessonAction({ topic, knowledgeLevel });
      if (!result.success) {
          throw new Error(result.message);
      }
      setLesson(result.lesson);
    } catch (e: any) {
      setError(e.message || 'Failed to generate lesson. Please try again.');
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
      setQuizScore(null);
      
      try {
          const lessonContent = `Title: ${lesson.title}\\nIntroduction: ${lesson.introduction.analogy}\\n${lesson.stepByStep.map(s => `Step: ${s.title}\\n${s.content}`).join('\\n\\n')}\\nConclusion: ${lesson.summary}`;
          const result = await generateQuizAction({ fileContent: lessonContent, fileName: lesson.title });
          if (!result.success) {
              throw new Error(result.message);
          }
          setQuiz(result.quiz);
          setQuizKey(prev => prev + 1);
      } catch(e: any) {
          setError(e.message || 'Failed to generate quiz. Please try again.');
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
      const result = await explainTopicFurtherAction({ 
        lesson,
        quizScore: quizScore ? (quizScore.score / quizScore.total) * 100 : undefined,
        userSummary: feedback ? userSummary : undefined,
      });

      if (!result.success) {
        throw new Error(result.message);
      }
      setFurtherExplanation(result.explanation);
      addXp(15);
    } catch (e: any) {
      setError(e.message || 'Failed to generate further explanation. Please try again.');
      console.error(e);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleCorrectAnswer = () => {
      addXp(20);
      addBadge('Quiz_Whiz');
  }

  const handleQuizCompletion = (finalScore: number, totalQuestions: number) => {
    if (totalQuestions > 0) {
        setQuizScore({ score: finalScore, total: totalQuestions });
    } else {
        setQuizScore(null); // Reset if quiz is restarted
    }
  };

  const handleGetFeedback = async () => {
      if (!userSummary || !lesson) return;
      setIsLoadingFeedback(true);
      setFeedback(null);
      setError(null);
      
      try {
        const result = await getFeedbackOnSummaryAction({
            lessonContent: getLessonAsText(lesson),
            userSummary: userSummary,
        });

        if(!result.success) {
            throw new Error(result.message);
        }
        setFeedback(result.feedback.feedback);
        addXp(30);
      } catch (e: any) {
        setError(e.message || 'Failed to get feedback.');
      } finally {
        setIsLoadingFeedback(false);
      }
  }

  const lessonContentForContext = getLessonAsText(lesson);

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
              <CardDescription>Enter any topic, select your knowledge level, and let the AI teach you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>What do you want to learn?</Label>
                <Input
                  placeholder="e.g., 'The Water Cycle', 'Python for web dev', 'World War II'"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading}
                />
              </div>
               <div className="space-y-2">
                <Label>What is your knowledge level on this topic?</Label>
                <RadioGroup
                  value={knowledgeLevel}
                  onValueChange={(v: KnowledgeLevel) => setKnowledgeLevel(v)}
                  className="flex flex-wrap gap-4"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner" className="font-normal cursor-pointer">Beginner</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate" className="font-normal cursor-pointer">Intermediate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced" className="font-normal cursor-pointer">Advanced</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button onClick={handleGenerateLesson} disabled={isLoading || !topic} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
                {isLoading ? 'Generating...' : 'Teach Me'}
              </Button>
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
            </Card>          )}

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

                    {lesson.narrative && (
                        <>
                            <Card className='bg-muted/50'>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-3 text-xl'>
                                        <Drama className='h-6 w-6 text-primary' />
                                        {lesson.narrative.title}
                                    </CardTitle>
                                    <CardDescription>
                                        A story to help you understand the topic better.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='prose prose-base max-w-none dark:prose-invert whitespace-pre-wrap'>
                                        <p>{lesson.narrative.story}</p>
                                        {lesson.narrative.moral && (
                                            <p className='italic text-muted-foreground'>
                                                <strong>Moral of the story:</strong> {lesson.narrative.moral}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            <Separator />
                        </>
                    )}


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

                     {furtherExplanation ? (
                       <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight text-center">{furtherExplanation.title}</h2>
                            <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto">{furtherExplanation.introduction}</p>
                            <div className="grid gap-6 mt-6">
                                {furtherExplanation.sections.map((section, index) => (
                                    <Card key={index} className="bg-background">
                                        <CardHeader>
                                            <CardTitle className="text-xl flex items-center gap-3"><Brain className="h-6 w-6 text-primary" /> {section.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="prose prose-base max-w-none dark:prose-invert whitespace-pre-wrap">{section.content}</div>
                                            {section.analogy && (
                                                <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-accent mt-4">
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
                             <Separator className="my-6" />
                            <p className="text-center text-muted-foreground">{furtherExplanation.conclusion}</p>
                        </div>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Dig Deeper</CardTitle>
                                <CardDescription>Want to know more? Let the AI explain the concepts in greater detail, adapting to your progress.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={handleExplainFurther} disabled={isLoadingExplanation}>
                                    {isLoadingExplanation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                                    {isLoadingExplanation ? 'Expanding...' : 'Explain Further'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}


                    <Separator />

                    <Card>
                        <CardHeader>
                            <CardTitle>Teach it Back!</CardTitle>
                            <CardDescription>One of the best ways to learn is to teach. Summarize what you just learned in your own words to solidify your understanding.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className='space-y-4' onSubmit={(e) => {
                                e.preventDefault();
                                handleGetFeedback();
                            }}>
                                <Textarea 
                                    placeholder="Explain the main concepts here..."
                                    rows={5}
                                    value={userSummary}
                                    onChange={(e) => setUserSummary(e.target.value)}
                                    disabled={isLoadingFeedback}
                                />
                                <Button disabled={isLoadingFeedback || !userSummary}>
                                  {isLoadingFeedback ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                  Get Feedback on my Summary
                                </Button>
                            </form>
                             {isLoadingFeedback && (
                                <div className='mt-4 flex items-center justify-center'>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    <p>Analyzing your summary...</p>
                                </div>
                             )}
                            {feedback && (
                                <Alert className='mt-4 border-green-500'>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertTitle className='text-green-700'>Feedback Received!</AlertTitle>
                                    <AlertDescription className='prose prose-sm max-w-none'>
                                      <p>{feedback}</p>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    <Separator />

                    <div className="space-y-4">
                        {quiz ? (
                            <QuizView key={quizKey} quiz={quiz} onCorrectAnswer={handleCorrectAnswer} onQuizComplete={handleQuizCompletion} />
                        ) : (
                            <div className='text-center'>
                                <Button onClick={handleGenerateQuiz} disabled={isLoadingQuiz} size="lg">
                                    {isLoadingQuiz ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                                    {isLoadingQuiz ? 'Generating Quiz...' : 'Test Your Knowledge!'}
                                </Button>
                            </div>
                        )}

                        {quizScore && (
                             <Alert variant="default" className="border-primary">
                                <Award className="h-4 w-4" />
                                <AlertTitle>Quiz Result</AlertTitle>
                                <AlertDescription>
                                    You scored {quizScore.score} out of {quizScore.total}. {quizScore.score / quizScore.total > 0.7 ? "Great job!" : "Keep practicing!"}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Chatbot
        lessonContext={lessonContentForContext}
        askSocraticQuestion={async (question) => {
            const result = await answerTopicQuestionAction({
                lessonContent: `Socratic Question: ${question}`,
                userQuestion: "Lead me to the answer socratically.",
            });
            return result.success ? result.answer : { title: "Error", introduction: "Could not get a socratic response.", sections: [], conclusion: "" };
        }}
        />
    </div>
  );
}

export default function UniversalTutorPage() {
  return (
    <UniversalTutorView />
  )
}
