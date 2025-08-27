
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Header } from '@/components/header';
import { BadgeIcon } from '@/components/icons';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/contexts/gamification-context';
import { ChevronLeft, LogIn, LogOut, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

function ProfileView() {
    const { name, email, level, xp, levelUpXp, badges, isLoaded, resetContext } = useGamification();
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

    const isLoggedIn = !!email;

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header showSidebarTrigger={false} />
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Link href="/" className='inline-block'>
                        <Button variant="outline" size="sm">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-3xl'>Your Profile</CardTitle>
                            <CardDescription>
                                {isLoggedIn ? "Your learning journey and achievements." : "Log in to see your progress and achievements."}
                            </CardDescription>
                        </CardHeader>
                        {isLoggedIn ? (
                            <CardContent className="grid gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-xl border-b pb-2">Account Information</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <p><strong>Name:</strong> {name}</p>
                                        <p><strong>Email:</strong> {email}</p>
                                    </div>
                                </div>
                                 <div className="space-y-4">
                                    <h3 className="font-semibold text-xl border-b pb-2">Learning Stats</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Level:</strong> {level}</p>
                                        <div>
                                          <p className="mb-1"><strong>Experience:</strong></p>
                                          <div className='flex items-center gap-2'>
                                            <Progress value={(xp / levelUpXp) * 100} className="h-3 w-full" />
                                            <span className='text-xs font-mono whitespace-nowrap'>{xp} / {levelUpXp} XP</span>
                                          </div>
                                        </div>
                                    </div>
                                </div>
                                 <div className="space-y-4">
                                    <h3 className="font-semibold text-xl border-b pb-2">Achievements</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                         {badges.length > 0 ? badges.map(badge => (
                                            <div key={badge.name} className="flex flex-col items-center text-center gap-2 p-4 border rounded-lg bg-muted/50 aspect-square justify-center">
                                               <BadgeIcon type={badge.icon} className="h-8 w-8 text-accent" />
                                               <p className="font-semibold text-sm">{badge.name.replace(/_/g, ' ')}</p>
                                               <p className='text-xs text-muted-foreground'>{badge.description}</p>
                                            </div>
                                         )) : <p>No badges earned yet. Keep learning to unlock them!</p>}
                                    </div>
                                </div>
                            </CardContent>
                        ) : (
                            <CardContent>
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>Please log in to view your profile.</p>
                                </div>
                            </CardContent>
                        )}
                        <CardFooter>
                            <div className="w-full">
                                <Separator className="mb-4" />
                                <div className="flex justify-end gap-2">
                                    {!isLoaded ? (
                                        <Skeleton className="h-10 w-44" />
                                    ) : isLoggedIn ? (
                                        <Button onClick={handleLogout} variant="destructive">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </Button>
                                    ) : (
                                        <>
                                            <Button asChild variant="outline">
                                                <Link href="/login">
                                                    <LogIn className="mr-2 h-4 w-4" />
                                                    Login
                                                </Link>
                                            </Button>
                                            <Button asChild>
                                                <Link href="/signup">
                                                    <UserPlus className="mr-2 h-4 w-4" />
                                                    Sign Up
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    )
}

export default function ProfilePage() {
    return (
        <ProfileView />
    )
}
