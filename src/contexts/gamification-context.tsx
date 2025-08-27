
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
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
  resetContext: () => void;
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

  const resetContext = useCallback(() => {
    setName("Guest");
    setEmail("");
    setLevel(1);
    setXp(0);
    setBadges([]);
    setLevelUpXp(LEVEL_XP_BASE);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (!isLoaded) {
          setIsLoaded(true);
        }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLoaded])

  const updateProgressInDb = useCallback(async (updatedProgress: { level: number, xp: number, badges: BadgeName[] }) => {
      if(!email) return; 
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
  }, [toast, email]);

  const addXp = useCallback((amount: number) => {
    if (!email) return; // Only signed-in users can gain XP
    
    setXp(currentXp => {
        let newXp = currentXp + amount;
        let currentLevel = level;
        let currentLevelUpXp = levelUpXp;

        while (newXp >= currentLevelUpXp) {
          newXp -= currentLevelUpXp;
          currentLevel++;
          currentLevelUpXp = Math.floor(calculateLevelDetails(currentLevel));
          // Trigger level up toast directly here
           toast({
                title: "Level Up!",
                description: `Congratulations, you've reached Level ${currentLevel}!`
            });
        }
        
        setLevel(currentLevel);
        setLevelUpXp(currentLevelUpXp);
        updateProgressInDb({ level: currentLevel, xp: newXp, badges: badges.map(b => b.name) });
        return newXp;
    });
  }, [level, levelUpXp, badges, updateProgressInDb, email, toast]);

  const addBadge = useCallback((name: BadgeName) => {
    if (!email) return; // Only signed-in users can earn badges
    
    setBadges(currentBadges => {
      if (!currentBadges.some(b => b.name === name)) {
        const newBadge = { name, ...badgeDetails[name] };
        const newBadges = [...currentBadges, newBadge];
        updateProgressInDb({ level, xp, badges: newBadges.map(b => b.name) });
        // Trigger new badge toast directly here
        toast({
            title: "New Badge Unlocked!",
            description: `You've earned the "${newBadge.name.replace(/_/g, ' ')}" badge!`
        });
        return newBadges;
      }
      return currentBadges;
    });
  }, [email, level, xp, updateProgressInDb, toast]);

  return (
    <GamificationContext.Provider
      value={{ xp, level, levelUpXp, badges, name, email, isLoaded, addXp, addBadge, loadInitialData, resetContext }}
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
