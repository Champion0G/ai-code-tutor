
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/models/user";

export type BadgeIconType = 'Star' | 'Zap' | 'BrainCircuit' | 'Award';
export type BadgeName = 'First_Explanation' | 'Code_Optimizer' | 'Archivist' | 'Quiz_Whiz';

interface Badge {
  name: BadgeName;
  description: string;
  icon: BadgeIconType;
}

const badgeDetails: Record<BadgeName, Omit<Badge, 'name'>> = {
  First_Explanation: { description: "Used 'Explain' for the first time.", icon: 'Star' },
  Code_Optimizer: { description: "Used 'Improve' feature.", icon: 'Zap' },
  Archivist: { description: "Summarized a file.", icon: 'BrainCircuit' },
  Quiz_Whiz: { description: "Answered a quiz question correctly.", icon: 'Award' },
};

interface GamificationContextType {
  xp: number;
  level: number;
  levelUpXp: number;
  badges: Badge[];
  name: string;
  email: string;
  isLoaded: boolean;
  addXp: (amount: number) => void;
  addBadge: (name: BadgeName) => void;
  loadInitialData: (data: User) => void;
  resetContext: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(
  undefined
);

const LEVEL_XP_BASE = 100;

export const GamificationProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // This ensures that for guests, the app is considered "loaded" and doesn't show skeleton states forever.
    const timer = setTimeout(() => {
        if (!isLoaded) {
          setIsLoaded(true);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [isLoaded])


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

  const addXp = useCallback(async (amount: number) => {
    if (!user) return;

    let newXp = user.xp + amount;
    let newLevel = user.level;
    let requiredXp = calculateLevelUpXp(newLevel);

    while (newXp >= requiredXp) {
        newXp -= requiredXp;
        newLevel++;
        requiredXp = calculateLevelUpXp(newLevel);
        toast({
            title: "Level Up!",
            description: `Congratulations, you've reached Level ${newLevel}!`
        });
    }

    const updatedUser = await updateProgressInDb({ level: newLevel, xp: newXp });
    if(updatedUser) {
        setUser(updatedUser);
    }
  }, [user, toast]);

  const addBadge = useCallback(async (badgeName: BadgeName) => {
    if (!user || user.badges.includes(badgeName)) return;

    const newBadges = [...user.badges, badgeName];
    const updatedUser = await updateProgressInDb({ badges: newBadges });
    
    if(updatedUser) {
        setUser(updatedUser);
        toast({
            title: "New Badge Unlocked!",
            description: `You've earned the "${badgeName.replace(/_/g, ' ')}" badge!`
        });
    }
  }, [user, toast]);

  return (
    <GamificationContext.Provider
      value={{ 
        xp: user?.xp ?? 0, 
        level: user?.level ?? 1, 
        levelUpXp: user ? calculateLevelUpXp(user.level) : LEVEL_XP_BASE, 
        badges: user?.badges.map(name => ({ name, ...badgeDetails[name] })) ?? [], 
        name: user?.name ?? "Guest", 
        email: user?.email ?? "", 
        isLoaded, 
        addXp, 
        addBadge, 
        loadInitialData, 
        resetContext 
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
