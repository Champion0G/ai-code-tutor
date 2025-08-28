
"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LexerIcon, BadgeIcon } from "@/components/icons";
import { useGamification } from "@/contexts/gamification-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { BrainCircuit, HomeIcon, User, LogIn, LogOut, UserPlus, Menu, FileText, BookOpen, Info, LifeBuoy, Bot, Coins } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Separator } from "./ui/separator";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function MainNav({ closeSidebar }: { closeSidebar?: () => void }) {
    const { email, name, resetContext } = useGamification();
    const router = useRouter();
    const { toast } = useToast();
    const isLoggedIn = !!email;

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (!response.ok) {
                throw new Error('Failed to logout');
            }
            resetContext();
            toast({ title: "Logged Out", description: "You have been successfully logged out." });
            closeSidebar?.();
            router.push('/');
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Could not log you out. Please try again." });
        }
    };

    const handleLinkClick = (path: string) => {
        router.push(path);
        closeSidebar?.();
    }

    const navLinkClasses = "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary";

    return (
        <div className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center gap-2">
                    <LexerIcon className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold font-headline tracking-tighter">Lexer</span>
                </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-auto">
                <nav className="grid gap-2 text-lg font-medium p-4">
                    <button onClick={() => handleLinkClick('/')} className={cn(navLinkClasses, "text-lg")}>
                        <HomeIcon className="h-5 w-5" />
                        Home
                    </button>
                    <Separator className="my-2" />
                    <h3 className="px-3 text-sm font-semibold text-muted-foreground/80">Learning Modes</h3>
                     <button onClick={() => handleLinkClick('/explainer')} className={cn(navLinkClasses)}>
                        <FileText className="h-4 w-4" />
                        Code Explainer
                    </button>
                    <button onClick={() => handleLinkClick('/tutor')} className={cn(navLinkClasses)}>
                        <BookOpen className="h-4 w-4" />
                        Topic Tutor
                    </button>
                    <button onClick={() => handleLinkClick('/universal-tutor')} className={cn(navLinkClasses)}>
                        <BrainCircuit className="h-4 w-4" />
                        Universal Tutor
                    </button>
                    <Separator className="my-2" />
                    <h3 className="px-3 text-sm font-semibold text-muted-foreground/80">Account</h3>
                    <button onClick={() => handleLinkClick('/profile')} className={cn(navLinkClasses)}>
                        <User className="h-4 w-4" />
                        Profile
                    </button>
                    <Separator className="my-2" />
                     <h3 className="px-3 text-sm font-semibold text-muted-foreground/80">Other</h3>
                     <button onClick={() => handleLinkClick('/about')} className={cn(navLinkClasses)}>
                        <Info className="h-4 w-4" />
                        About
                    </button>
                    <button onClick={() => handleLinkClick('/support')} className={cn(navLinkClasses)}>
                        <LifeBuoy className="h-4 w-4" />
                        Support
                    </button>
                    <button onClick={() => handleLinkClick('/credits')} className={cn(navLinkClasses)}>
                        <Coins className="h-4 w-4" />
                        AI Credits
                    </button>
                </nav>
            </div>

            <div className="mt-auto border-t p-4">
                {isLoggedIn ? (
                    <div className="space-y-3">
                         <div className="text-sm">
                            <p className="font-semibold">{name}</p>
                            <p className="text-xs text-muted-foreground">{email}</p>
                        </div>
                        <Button onClick={handleLogout} variant="outline" className="w-full">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <Button asChild variant="outline">
                            <Link href="/login" onClick={closeSidebar}>
                                <LogIn className="mr-2 h-4 w-4" />
                                Login
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/signup" onClick={closeSidebar}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Sign Up
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function Header({ showSidebarTrigger = true }: { showSidebarTrigger?: boolean }) {
  const { xp, level, badges, levelUpXp, isLoaded, aiUsageCount, aiUsageLimit } = useGamification();
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-2 md:px-4 shrink-0">
      <div className="flex items-center gap-2">
        <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open Main Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[300px] sm:w-[340px]">
                <MainNav closeSidebar={() => setIsNavOpen(false)} />
            </SheetContent>
        </Sheet>
        {showSidebarTrigger && (
          <div className="lg:hidden">
            <SidebarTrigger />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          {isLoaded ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground cursor-default">
                    <Bot className="h-5 w-5 text-primary" />
                    <span>{aiUsageLimit - aiUsageCount}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI credits remaining today</p>
                </TooltipContent>
              </Tooltip>

              <div className="w-32 hidden sm:block">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Level {level}</span>
                        <span className="text-xs text-muted-foreground">
                          {xp}/{levelUpXp} XP
                        </span>
                      </div>
                      <Progress value={(xp / levelUpXp) * 100} className="h-2" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{levelUpXp - xp} XP to next level</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                {badges && badges.map((badge) => (
                  <Tooltip key={badge.name}>
                    <TooltipTrigger asChild>
                      <div className="rounded-full bg-accent/20 p-1.5 border border-accent/50">
                        <BadgeIcon
                          type={badge.icon}
                          className="h-5 w-5 text-accent"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{badge.name.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </>
          ) : (
             <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-8 w-32 hidden sm:block" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-1 md:gap-2">
             <Link href="/profile" passHref>
                <Button size="icon" variant="outline" className="h-9 w-9 md:w-auto md:px-3">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline md:ml-2">Profile</span>
                </Button>
            </Link>
        </div>
      </div>
    </header>
  );
}
