
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGamification } from '@/contexts/gamification-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ModeSelection } from '@/components/mode-selection';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, User } from 'lucide-react';

export default function Home() {
  const { isLoaded, email, resetContext } = useGamification();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Failed to logout');
        }
        resetContext();
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        router.push('/');
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Could not log you out. Please try again." });
    }
  };

  return (
    <>
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
            <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
          </div>
        ) : (
          <div className="space-x-2">
            <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
            </Button>
             <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
      <ModeSelection />
    </>
  );
}
