
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CodeAlchemistIcon, BadgeIcon } from "@/components/icons";
import { useGamification } from "@/contexts/gamification-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { HomeIcon, User } from "lucide-react";

export function Header({ showSidebarTrigger = true }: { showSidebarTrigger?: boolean }) {
  const { xp, level, badges, levelUpXp, isLoaded } = useGamification();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-2 md:px-4 shrink-0">
      <div className="flex items-center gap-2">
        {showSidebarTrigger && (
          <div className="lg:hidden">
            <SidebarTrigger />
          </div>
        )}
        <CodeAlchemistIcon className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tighter hidden sm:inline-block">Code Alchemist</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          {isLoaded ? (
            <>
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
                <Skeleton className="h-8 w-32 hidden sm:block" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-1 md:gap-2">
            <Link href="/" passHref>
                <Button size="icon" variant="outline" className="h-9 w-9 md:w-auto md:px-3">
                    <HomeIcon className="h-4 w-4" />
                    <span className="hidden md:inline md:ml-2">Home</span>
                </Button>
            </Link>
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
