
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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
  loadInitialData: (data: { name: string, email: string, level: number, xp: number, badges: BadgeName[]}) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(
  undefined
);

const LEVEL_XP_BASE = 100;

export const GamificationProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [name, setName] = useState("Guest");
  const [email, setEmail] = useState("");
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelUpXp, setLevelUpXp] = useState(LEVEL_XP_BASE);
  const [badges, setBadges] = useState<Badge[]>([]);

  const calculateLevelDetails = (currentLevel: number) => {
      return LEVEL_XP_BASE * Math.pow(1.5, currentLevel - 1);
  }

  const loadInitialData = useCallback((data: { name: string, email: string, level: number, xp: number, badges: BadgeName[]}) => {
    setName(data.name);
    setEmail(data.email);
    setLevel(data.level);
    setXp(data.xp);
    setBadges(data.badges.map(name => ({ name, ...badgeDetails[name] })));
    setLevelUpXp(Math.floor(calculateLevelDetails(data.level)));
    setIsLoaded(true);
  }, []);

  const updateProgressInDb = async (updatedProgress: { level: number, xp: number, badges: BadgeName[] }) => {
      try {
        const response = await fetch('/api/user/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProgress),
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to save progress.');
        }
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: "Sync Error",
              description: "Could not save your progress to the server."
          })
      }
  }

  const addXp = useCallback((amount: number) => {
    setXp((currentXp) => {
      let newXp = currentXp + amount;
      let newLevel = level;
      let newLevelUpXp = levelUpXp;

      while (newXp >= newLevelUpXp) {
        newXp -= newLevelUpXp;
        newLevel++;
        newLevelUpXp = Math.floor(calculateLevelDetails(newLevel));
        toast({
            title: "Level Up!",
            description: `Congratulations, you've reached Level ${newLevel}!`
        })
      }

      setLevel(newLevel);
      setLevelUpXp(newLevelUpXp);
      
      updateProgressInDb({ level: newLevel, xp: newXp, badges: badges.map(b => b.name) });
      return newXp;
    });
  }, [level, levelUpXp, badges, toast]);

  const addBadge = useCallback((name: BadgeName) => {
    setBadges((currentBadges) => {
      if (!currentBadges.some(b => b.name === name)) {
        const newBadges = [...currentBadges, { name, ...badgeDetails[name] }];
        toast({
            title: "New Badge Unlocked!",
            description: `You've earned the "${name.replace(/_/g, ' ')}" badge!`
        })
        updateProgressInDb({ level, xp, badges: newBadges.map(b => b.name) });
        return newBadges;
      }
      return currentBadges;
    });
  }, [level, xp, toast]);

  return (
    <GamificationContext.Provider
      value={{ xp, level, levelUpXp, badges, name, email, isLoaded, addXp, addBadge, loadInitialData }}
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
