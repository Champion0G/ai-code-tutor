
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LexerIcon } from '@/components/icons';
import { ChevronLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <Card className="mx-auto max-w-2xl w-full">
        <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
               <LexerIcon className="h-10 w-10 text-primary" />
               <CardTitle className="text-3xl font-headline">About Lexer</CardTitle>
            </div>
            <CardDescription className="text-lg">
                Your AI-Powered Coding and Learning Companion
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center text-muted-foreground">
            <p>
                Lexer is an innovative platform designed to revolutionize the way you learn and interact with code. Whether you're a beginner taking your first steps into programming or an experienced developer exploring a new codebase, Lexer provides intelligent tools to accelerate your understanding and productivity.
            </p>
            <p>
                Our mission is to make learning accessible, engaging, and effective for everyone. By leveraging the power of advanced AI, we offer features like on-demand code explanations, intelligent improvement suggestions, and adaptive, topic-based tutoring that caters to your unique learning style.
            </p>
             <p className="font-semibold text-foreground">
                Happy coding!
            </p>
            <div className="pt-6">
                <Button asChild variant="outline">
                    <Link href="/">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
