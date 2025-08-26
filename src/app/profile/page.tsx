
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { BadgeIcon } from '@/components/icons';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/contexts/gamification-context';

function ProfileView() {
    const { name, email, level, xp, levelUpXp, badges } = useGamification();

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header showSidebarTrigger={false} />
            <main className="flex-1 overflow-auto p-4 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-3xl'>Your Profile</CardTitle>
                            <CardDescription>Your learning journey and achievements.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-xl border-b pb-2">Account Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                     {badges.length > 0 ? badges.map(badge => (
                                        <div key={badge.name} className="flex flex-col items-center text-center gap-2 p-4 border rounded-lg bg-muted/50 aspect-square justify-center">
                                           <BadgeIcon type={badge.icon} className="h-8 w-8 text-accent" />
                                           <p className="font-semibold text-sm">{badge.name.replace(/_/g, ' ')}</p>
                                           <p className='text-xs text-muted-foreground'>{badge.description}</p>
                                        </div>
                                     )) : <p>No badges earned yet. Keep learning to unlock them!</p>}
                                </div>
                            </div>
                            <div className='pt-4'>
                                <Link href="/">
                                    <Button variant="outline">Back to Home</Button>
                                </Link>
                            </div>
                        </CardContent>
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
