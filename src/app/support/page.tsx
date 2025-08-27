
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, ChevronLeft } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <Card className="mx-auto max-w-lg w-full">
        <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
               <LifeBuoy className="h-10 w-10 text-primary" />
               <CardTitle className="text-3xl">Contact Support</CardTitle>
            </div>
            <CardDescription>
                If you encounter any issues or have any questions, please don't hesitate to reach out.
            </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
            <p>
                You can email us directly at:
            </p>
            <a href="mailto:techchampion08@gmail.com" className="text-lg font-semibold text-primary hover:underline">
                techchampion08@gmail.com
            </a>
            <p className="text-sm text-muted-foreground pt-4">
                We'll do our best to get back to you as soon as possible.
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
