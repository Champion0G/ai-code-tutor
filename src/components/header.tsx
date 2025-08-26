
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

export function Header({ showSidebarTrigger = true }: { showSidebarTrigger?: boolean }) {
  const { xp, level, badges, levelUpXp, isLoaded } = useGamification();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 shrink-0">
      <div className="flex items-center gap-2">
        {showSidebarTrigger && (
          <div className="lg:hidden">
            <SidebarTrigger />
          </div>
        )}
        <CodeAlchemistIcon className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tighter">Code Alchemist</h1>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-4">
          {isLoaded ? (
            <>
              <div className="w-32">
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
              <div className="flex items-center gap-2">
                {badges.map((badge) => (
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
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-20" />
            </div>
          )}
        </div>

        <Link href="/profile">
          <Button size="sm" variant="outline">
            Profile
          </Button>
        </Link>
      </div>
    </header>
  );
}
