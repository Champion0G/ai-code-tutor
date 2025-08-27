
"use client";

import { useRouter } from 'next/navigation';
import { useGamification } from '@/contexts/gamification-context';
import { useToast } from '@/hooks/use-toast';
import { ModeSelection } from '@/components/mode-selection';


export default function Home() {
  const { resetContext } = useGamification();
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
    <ModeSelection onLogout={handleLogout} />
  );
}
