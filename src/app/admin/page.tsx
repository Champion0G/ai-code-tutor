
"use client";

import { useEffect, useState } from 'react';
import { User } from '@/models/user';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useGamification } from '@/contexts/gamification-context';

async function getUsers(): Promise<{ success: boolean; users?: User[]; message?: string, status?: number }> {
    try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        return { ...data, status: response.status };
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const { email: userEmail, isLoaded } = useGamification();

    useEffect(() => {
        if (!isLoaded) return;

        const fetchUsers = async () => {
            setIsLoading(true);
            const result = await getUsers();
            if (result.success && result.users) {
                setUsers(result.users);
                setIsAuthorized(true);
            } else {
                setError(result.message || "Failed to load user data.");
                if (result.status === 403 || result.status === 401) {
                    setIsAuthorized(false);
                }
            }
            setIsLoading(false);
        };
        fetchUsers();
    }, [isLoaded, userEmail]);

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    const renderContent = () => {
        if (isLoading || !isLoaded) {
            return (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-center">Level</TableHead>
                            <TableHead className="text-center">XP</TableHead>
                            <TableHead>Badges</TableHead>
                            <TableHead>Joined On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )
        }

        if (!isAuthorized) {
            return (
                 <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>{error || "You are not authorized to view this page."}</AlertDescription>
                </Alert>
            )
        }

        if (error) {
             return (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }

        return (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-center">Level</TableHead>
                        <TableHead className="text-center">XP</TableHead>
                        <TableHead>Badges</TableHead>
                        <TableHead>Joined On</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={String(user._id)}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="text-center">{user.level}</TableCell>
                            <TableCell className="text-center">{user.xp}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {user.badges.map(badge => (
                                        <Badge key={badge} variant="secondary">{badge.replace(/_/g, ' ')}</Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                        </TableRow>
                    ))}
                    {!isLoading && users.length === 0 && !error && (
                        <TableRow>
                           <TableCell colSpan={6} className="py-10 text-center">No users found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header showSidebarTrigger={false} />
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <Link href="/" className='inline-block'>
                        <Button variant="outline" size="sm">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">Admin Panel</CardTitle>
                            <CardDescription>View all registered users and their progress.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {renderContent()}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
