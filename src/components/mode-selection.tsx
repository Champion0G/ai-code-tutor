
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LexerIcon } from './icons';
import { FileText, BookOpen, LifeBuoy, BrainCircuit, TestTube } from 'lucide-react';
import { Header } from './header';


export function ModeSelection() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header showSidebarTrigger={false} />
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <LexerIcon className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                    <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter">Welcome to Lexer</h1>
                </div>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl text-center mx-auto">
                    Your personal AI-powered code tutor. Choose your learning path below to get started.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-4 mb-2">
                        <FileText className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl font-headline">Code Explainer</CardTitle>
                        </div>
                        <CardDescription>
                        Explore an existing codebase with an AI assistant. Get explanations, summaries, and suggestions for improvement.
                        <span className="block font-semibold text-primary mt-2">Best for project-based learning.</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Navigate file structures like in a real IDE.</li>
                        <li>Select code snippets for detailed explanations.</li>
                        <li>Generate summaries for entire files.</li>
                        <li>Get AI-powered suggestions to improve code quality.</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Link href="/explainer" className="w-full">
                        <Button className="w-full">Start Explaining</Button>
                        </Link>
                    </CardFooter>
                </Card>
                
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-4 mb-2">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl font-headline">Topic Tutor</CardTitle>
                        </div>
                        <CardDescription>
                        Learn specific programming concepts from scratch. The AI will guide you with structured lessons and examples.
                        <span className="block font-semibold text-primary mt-2">Best for mastering specific topics.</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Enter any programming topic you want to learn.</li>
                        <li>Receive structured, easy-to-follow lessons.</li>
                        <li>Study dynamic code examples for each concept.</li>
                        <li>Ask follow-up questions to deepen understanding.</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Link href="/tutor" className="w-full">
                        <Button className="w-full">Start Learning</Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-4 mb-2">
                        <BrainCircuit className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl font-headline">Universal Tutor</CardTitle>
                        </div>
                        <CardDescription>
                        An adaptive tutor for any subject, using a multi-modal teaching framework to match your learning style.
                        <span className="block font-semibold text-primary mt-2">Best for a fun, gamified way to learn anything.</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Learn any topic: math, history, science, and more.</li>
                        <li>Get explanations in multiple styles: analogy, story, etc.</li>
                        <li>Interactive quizzes and hands-on activities.</li>
                        <li>Adaptive challenges that match your skill level.</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Link href="/universal-tutor" className="w-full">
                        <Button className="w-full">Begin Universal Learning</Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-4 mb-2">
                        <TestTube className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl font-headline">Knowledge Tester</CardTitle>
                        </div>
                        <CardDescription>
                        An adaptive quiz engine that tests your knowledge with progressively difficult questions.
                        <span className="block font-semibold text-primary mt-2">Best for validating your expertise.</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Get tested on any topic you choose.</li>
                        <li>Adaptive difficulty from Beginner to Expert.</li>
                        <li>Varied question types (MCQ, short answer, etc.).</li>
                        <li>Earn XP and prove your mastery.</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Link href="/knowledge-tester" className="w-full">
                        <Button className="w-full">Test Your Knowledge</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
            <div className="mt-12 text-center">
                <Link href="/support" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <LifeBuoy className="h-4 w-4" />
                    Contact Support
                </Link>
            </div>
        </div>
      </main>
    </div>
  );
}
