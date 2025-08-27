
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CodeAlchemistIcon } from './icons';
import { FileText, BookOpen, LifeBuoy, BrainCircuit, User, LogOut } from 'lucide-react';
import { useGamification } from '@/contexts/gamification-context';
import { Skeleton } from './ui/skeleton';


interface ModeSelectionProps {
    onLogout: () => void;
}


export function ModeSelection({ onLogout }: ModeSelectionProps) {
  const { isLoaded, email } = useGamification();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="absolute top-4 right-4 z-10">
        {!isLoaded ? (
            <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
            </div>
        ) : email ? (
          <div className="flex items-center gap-2">
             <Link href="/profile" passHref>
                <Button variant="outline" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                </Button>
            </Link>
            <Button onClick={onLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
            </Button>
             <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-8 text-center">
        <CodeAlchemistIcon className="h-10 w-10 md:h-12 md:w-12 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">Welcome to Code Alchemist</h1>
      </div>
      <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl text-center">
        Your personal AI-powered code tutor. Choose your learning path below to get started.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full px-4">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4 mb-2">
              <FileText className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Code Explainer</CardTitle>
            </div>
            <CardDescription>
              Explore an existing codebase with the help of an AI assistant. Get explanations, summaries, and suggestions for improvement.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Navigate file structures like in a real IDE.</li>
              <li>Select code snippets to get detailed explanations.</li>
              <li>Generate summaries for entire files.</li>
              <li>Get AI-powered suggestions to improve code quality.</li>
              <li>Test your understanding with generated quizzes.</li>
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
              <CardTitle className="text-2xl">Topic Tutor</CardTitle>
            </div>
            <CardDescription>
              Learn specific programming concepts from scratch. The AI will guide you with structured lessons, examples, and exercises.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
             <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Enter any programming topic you want to learn.</li>
              <li>Receive structured, easy-to-follow lessons.</li>
              <li>Study dynamic code examples for each concept.</li>
              <li>Complete interactive exercises to solidify your knowledge.</li>
              <li>Track your mastery of different topics over time.</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/tutor" className="w-full">
              <Button className="w-full">Start Learning</Button>
            </Link>
          </CardFooter>
        </Card>
         <Card className="flex flex-col md:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-4 mb-2">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Universal AI Tutor</CardTitle>
            </div>
            <CardDescription>
              An adaptive tutor for any subject, using a multi-modal teaching framework to match your learning style.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
             <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Learn any topic: math, history, science, and more.</li>
              <li>Get explanations in multiple styles: analogy, deep dive, etc.</li>
              <li>Interactive quizzes and hands-on activities.</li>
              <li>Adaptive challenges that match your skill level.</li>
              <li>Gamified experience with levels and achievements.</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/universal-tutor" className="w-full">
              <Button className="w-full">Begin Universal Learning</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
       <div className="mt-12 text-center">
          <Link href="/support" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <LifeBuoy className="h-4 w-4" />
            Contact Support
          </Link>
        </div>
    </div>
  );
}
