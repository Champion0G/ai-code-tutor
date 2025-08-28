
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, ChevronLeft, UserPlus, Infinity } from 'lucide-react';
import { AI_USAGE_LIMIT_GUEST } from '@/contexts/gamification-context';


export default function CreditsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <Card className="mx-auto max-w-2xl w-full">
        <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
               <Coins className="h-10 w-10 text-primary" />
               <CardTitle className="text-3xl font-headline">About AI Credits</CardTitle>
            </div>
            <CardDescription className="text-lg">
                How our daily usage limits work.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
            <p>
                To ensure fair usage and keep Lexer available to everyone, we have a daily limit on how many times guests can use our AI-powered features. Registered users enjoy unlimited access.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div className="p-6 bg-muted/50 rounded-lg">
                    <h3 className="text-2xl font-bold text-foreground">{AI_USAGE_LIMIT_GUEST}</h3>
                    <p className="font-semibold">Daily Credits for Guests</p>
                </div>
                 <div className="p-6 bg-muted/50 rounded-lg">
                    <Infinity className="h-10 w-10 mx-auto text-foreground" />
                    <p className="font-semibold mt-2">Unlimited Credits for Registered Users</p>
                </div>
            </div>
            <p>
                For guest users, your credit balance automatically resets every 24 hours. Creating a free account gives you unlimited credits, and allows you to track your learning progress, earn badges, and save your work.
            </p>
            <div className="text-center">
                <Button asChild>
                    <Link href="/signup">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up for Free
                    </Link>
                </Button>
            </div>
             <p className="font-semibold text-foreground text-center">
                Thank you for your understanding!
            </p>
            <div className="pt-6 text-center">
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
