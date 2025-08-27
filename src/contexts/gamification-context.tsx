
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
  const isInitialLoad = useRef(true);


  // Effect for level-up toast
  useEffect(() => {
    // Don't show toast on initial load or if user is not logged in
    if (!isLoaded || isInitialLoad.current || !email) return;
    toast({
        title: "Level Up!",
        description: `Congratulations, you've reached Level ${level}!`
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // Effect for new badge toast
  useEffect(() => {
    // Don't show on initial load or if the user is not logged in.
    if (!isLoaded || isInitialLoad.current || !email) return;

    const latestBadge = badges[badges.length - 1];
    
    if (latestBadge) {
        toast({
            title: "New Badge Unlocked!",
            description: `You've earned the "${latestBadge.name.replace(/_/g, ' ')}" badge!`
        });
    }
    // We only want to run this when a new badge is added.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badges.length]);

  const calculateLevelDetails = (currentLevel: number) => {
      return LEVEL_XP_BASE * Math.pow(1.5, currentLevel - 1);
  }

  const loadInitialData = useCallback((data: { name: string, email: string, level: number, xp: number, badges: BadgeName[]}) => {
    isInitialLoad.current = true; // Mark the start of loading initial data
    setName(data.name);
    setEmail(data.email);
    setLevel(data.level);
    setXp(data.xp);
    setBadges(data.badges.map(name => ({ name, ...badgeDetails[name] })));
    setLevelUpXp(Math.floor(calculateLevelDetails(data.level)));
    setIsLoaded(true);
    // Use a timeout to flip the initial load flag after the first render cycle
    setTimeout(() => {
      isInitialLoad.current = false;
    }, 500);
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

  // On initial load, if there's no user data being loaded (i.e. not logged in), 
  // we still need to set isLoaded to true.
  useEffect(() => {
    // If after a moment, we're still not loaded (i.e. loadInitialData was not called),
    // assume the user is not logged in and set loading to complete.
    const timer = setTimeout(() => {
        if (!isLoaded) {
            setIsLoaded(true);
            isInitialLoad.current = false;
        }
    }, 1000); // 1 second delay
    return () => clearTimeout(timer);
  }, [isLoaded])

  const updateProgressInDb = useCallback(async (updatedProgress: { level: number, xp: number, badges: BadgeName[] }) => {
      if(!email) return; // Do not save progress for guest users
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
    if (!email) return; // Don't add XP for guest users
    setXp(currentXp => {
        let newXp = currentXp + amount;
        let newLevel = level;
        let newLevelUpXp = levelUpXp;

        while (newXp >= newLevelUpXp) {
          newXp -= newLevelUpXp;
          newLevel++;
          newLevelUpXp = Math.floor(calculateLevelDetails(newLevel));
        }
        
        if (newLevel > level) {
            setLevel(newLevel);
        }
        
        setLevelUpXp(newLevelUpXp);
        updateProgressInDb({ level: newLevel, xp: newXp, badges: badges.map(b => b.name) });
        return newXp;
    });
  }, [level, levelUpXp, badges, updateProgressInDb, email]);

  const addBadge = useCallback((name: BadgeName) => {
    if (!email) return; // Don't add badges for guest users
    if (!badges.some(b => b.name === name)) {
      const newBadges = [...badges, { name, ...badgeDetails[name] }];
      setBadges(newBadges);
      updateProgressInDb({ level, xp, badges: newBadges.map(b => b.name) });
    }
  }, [badges, level, xp, updateProgressInDb, email]);

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
