
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert, ChevronLeft } from 'lucide-react';
import { User } from '@/models/user';
import { Badge } from '@/components/ui/badge';
import { useGamification } from '@/contexts/gamification-context';

type UserData = Omit<User, 'password'>;

export default function AdminPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { userRole, isLoaded } = useGamification();

    useEffect(() => {
        if (!isLoaded) return; // Wait for gamification context to be loaded

        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/admin/users');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch user data.');
                }
                
                setUsers(data.users);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        
        // Only fetch if user is admin, otherwise set error
        if (userRole === 'admin') {
            fetchUsers();
        } else {
            setError('Access Denied: You are not authorized to view this page.');
            setIsLoading(false);
        }

    }, [userRole, isLoaded]);

    const renderContent = () => {
        if (isLoading || !isLoaded) {
            return (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                    <p>Loading user data...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="py-12">
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Access Denied</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            );
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-center">Level</TableHead>
                        <TableHead className="text-center">XP</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user._id.toString()}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center">{user.level}</TableCell>
                            <TableCell className="text-center">{user.xp}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header showSidebarTrigger={false} />
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                     <Link href="/" className='inline-block'>
                        <Button variant="outline" size="sm">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">Admin Panel</CardTitle>
                            <CardDescription>
                                A list of all registered users in the application.
                            </CardDescription>
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
