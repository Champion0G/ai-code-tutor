
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';

function ProfileView() {
    // This will be replaced with real user data later
    const user = {
        name: "Alex Doe",
        email: "alex.doe@example.com",
        level: 5,
        xp: 350,
        levelUpXp: 500,
        badges: [
            { name: "First_Explanation", description: "Used 'Explain' for the first time.", icon: "Star" },
            { name: "Code_Optimizer", description: "Used 'Improve' feature.", icon: "Zap" },
        ]
    }

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header showSidebarTrigger={false} />
            <main className="flex-1 overflow-auto p-4 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-3xl'>Profile</CardTitle>
                            <CardDescription>View your learning journey and achievements.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Account Information</h3>
                                <p><strong>Name:</strong> {user.name}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                            </div>
                             <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Learning Stats</h3>
                                <p><strong>Level:</strong> {user.level}</p>
                                <p><strong>Experience:</strong> {user.xp} / {user.levelUpXp} XP</p>
                            </div>
                             <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Badges</h3>
                                <div className="flex gap-4">
                                     {user.badges.length > 0 ? user.badges.map(badge => (
                                        <div key={badge.name} className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                                           <span>{badge.name.replace(/_/g, ' ')}</span>
                                        </div>
                                     )) : <p>No badges earned yet.</p>}
                                </div>
                            </div>
                            <Link href="/">
                                <Button>Back to Home</Button>
                            </Link>
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
