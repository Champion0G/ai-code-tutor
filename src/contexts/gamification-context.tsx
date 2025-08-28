
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/models/user";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ToastAction } from "@/components/ui/toast";

export type BadgeIconType = 'Star' | 'Zap' | 'BrainCircuit' | 'Award';
export type BadgeName = 'First_Explanation' | 'Code_Optimizer' | 'Archivist' | 'Quiz_Whiz';

interface Badge {
  name: BadgeName;
  description: string;
  icon: BadgeIconType;
}

export const AI_USAGE_LIMIT_GUEST = 25;


const badgeDetails: Record<BadgeName, Omit<Badge, 'name'>> = {
  First_Explanation: { description: "Used 'Explain' for the first time.", icon: 'Star' },
  Code_Optimizer: { description: "Used 'Improve' feature.", icon: 'Zap' },
  Archivist: { description: "Summarized a file.", icon: 'BrainCircuit' },
  Quiz_Whiz: { description: "Answered a quiz question correctly.", icon: 'Award' },
};

interface GuestUsage {
    count: number;
    lastReset: number; // timestamp
}

interface GamificationContextType {
  xp: number;
  level: number;
  levelUpXp: number;
  badges: Badge[];
  name: string;
  email: string;
  isLoaded: boolean;
  aiUsageCount: number;
  aiUsageLimit: number;
  addXp: (amount: number) => void;
  addBadge: (name: BadgeName) => void;
  loadInitialData: (data: User) => void;
  resetContext: () => void;
  checkAndIncrementUsage: () => Promise<boolean>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(
  undefined
);

const LEVEL_XP_BASE = 100;

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


export const GamificationProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [guestUsage, setGuestUsage] = useState<GuestUsage>({ count: 0, lastReset: Date.now() });

  const prevLevel = usePrevious(user?.level);
  const prevBadges = usePrevious(user?.badges);

  useEffect(() => {
    if (!user) { // Guest user
        try {
            const storedUsage = localStorage.getItem('guestAiUsage');
            if (storedUsage) {
                const parsed: GuestUsage = JSON.parse(storedUsage);
                const oneDay = 24 * 60 * 60 * 1000;
                if (Date.now() - parsed.lastReset > oneDay) {
                    setGuestUsage({ count: 0, lastReset: Date.now() });
                } else {
                    setGuestUsage(parsed);
                }
            }
        } catch (e) {
            console.error("Could not parse guest usage from localStorage", e);
        }
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) {
        if (prevLevel !== undefined && user.level > prevLevel) {
            toast({
                title: "Level Up!",
                description: `Congratulations, you've reached Level ${user.level}!`
            });
        }
        
        if (prevBadges !== undefined && user.badges && user.badges.length > prevBadges.length) {
            const newBadgeName = user.badges[user.badges.length - 1];
            if (newBadgeName && badgeDetails[newBadgeName]) {
                 toast({
                    title: "New Badge Unlocked!",
                    description: `You've earned the "${newBadgeName.replace(/_/g, ' ')}" badge!`
                });
            }
        }
    }
  }, [user, isLoaded, prevLevel, prevBadges, toast]);
  

  useEffect(() => {
    const timer = setTimeout(() => {
        if (!isLoaded) {
          setIsLoaded(true);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [isLoaded]);


  const calculateLevelUpXp = (level: number) => {
    return Math.floor(LEVEL_XP_BASE * Math.pow(1.5, level - 1));
  }
  
  const setStateFromUserData = (data: User | null) => {
      setUser(data);
      setIsLoaded(true);
  }

  const loadInitialData = useCallback((data: User) => {
    setStateFromUserData(data);
  }, []);

  const resetContext = useCallback(() => {
    setStateFromUserData(null);
  }, []);

  const updateProgressInDb = async (updatedProgress: Partial<User>) => {
      if(!user?.email) return null; 
      try {
        const response = await fetch('/api/user/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProgress),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to save progress.');
        }
        return data.user as User;
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: "Sync Error",
              description: "Could not save your progress to the server."
          })
          return null;
      }
  };

  const checkAndIncrementUsage = async (): Promise<boolean> => {
    const showLimitToast = (message: string) => {
        toast({
            variant: 'destructive',
            title: "Daily Limit Reached",
            description: message,
            action: (
                <ToastAction altText="Learn More" asChild>
                    <Link href="/credits">Learn More</Link>
                </ToastAction>
            )
        });
    }

    if (user) { // Registered user - no limit
        const response = await fetch('/api/user/usage', { method: 'POST' });
        const data = await response.json();
        if (response.ok) {
            setUser(data.user);
            return true;
        } else {
             toast({ variant: 'destructive', title: "Error", description: data.message || "Could not verify AI usage." });
            return false;
        }
    } else { // Guest user
        if (guestUsage.count >= AI_USAGE_LIMIT_GUEST) {
            showLimitToast("As a guest, you can make 25 AI requests per day. Sign up for more.");
            return false;
        }
        const newUsage = { count: guestUsage.count + 1, lastReset: guestUsage.lastReset };
        setGuestUsage(newUsage);
        try {
            localStorage.setItem('guestAiUsage', JSON.stringify(newUsage));
        } catch (e) {
            console.error("Could not save guest usage to localStorage", e);
        }
        return true;
    }
  }

  const addXp = useCallback(async (amount: number) => {
    if (!user) return;

    let newXp = user.xp + amount;
    let newLevel = user.level;
    let requiredXp = calculateLevelUpXp(newLevel);

    while (newXp >= requiredXp) {
        newXp -= requiredXp;
        newLevel++;
        requiredXp = calculateLevelUpXp(newLevel);
    }

    const updatedUser = await updateProgressInDb({ level: newLevel, xp: newXp });
    if(updatedUser) {
        setUser(updatedUser);
    }
  }, [user]);

  const addBadge = useCallback(async (badgeName: BadgeName) => {
    if (!user || (user.badges && user.badges.includes(badgeName))) return;

    const newBadges = [...(user.badges || []), badgeName];
    const updatedUser = await updateProgressInDb({ badges: newBadges });
    
    if(updatedUser) {
        setUser(updatedUser);
    }
  }, [user]);

  const mappedBadges = user?.badges?.map(name => ({ name, ...badgeDetails[name] })) ?? [];

  const aiUsageCount = user ? (user.aiUsageCount || 0) : guestUsage.count;
  const aiUsageLimit = user ? Infinity : AI_USAGE_LIMIT_GUEST;

  return (
    <GamificationContext.Provider
      value={{ 
        xp: user?.xp ?? 0, 
        level: user?.level ?? 1, 
        levelUpXp: user ? calculateLevelUpXp(user.level) : LEVEL_XP_BASE, 
        badges: mappedBadges, 
        name: user?.name ?? "Guest", 
        email: user?.email ?? "", 
        isLoaded, 
        aiUsageCount,
        aiUsageLimit,
        addXp, 
        addBadge, 
        loadInitialData, 
        resetContext,
        checkAndIncrementUsage
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
};
