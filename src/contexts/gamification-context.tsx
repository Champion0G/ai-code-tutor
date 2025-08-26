
"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

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
  name: string; // Add name
  email: string; // Add email
  addXp: (amount: number) => void;
  addBadge: (name: BadgeName) => void;
  // We can add a function to set user info later
}

const GamificationContext = createContext<GamificationContextType | undefined>(
  undefined
);

const LEVEL_XP_BASE = 100;

export const GamificationProvider = ({ children }: { children: ReactNode }) => {
  // Mock user data for now
  const [name, setName] = useState("Alex Doe");
  const [email, setEmail] = useState("alex.doe@example.com");

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelUpXp, setLevelUpXp] = useState(LEVEL_XP_BASE);
  const [badges, setBadges] = useState<Badge[]>([]);

  const addXp = useCallback((amount: number) => {
    setXp((currentXp) => {
      let newXp = currentXp + amount;
      let newLevel = level;
      let newLevelUpXp = levelUpXp;

      while (newXp >= newLevelUpXp) {
        newXp -= newLevelUpXp;
        newLevel++;
        newLevelUpXp = Math.floor(newLevelUpXp * 1.5);
      }

      if (newLevel > level) {
        setLevel(newLevel);
        setLevelUpXp(newLevelUpXp);
      }
      
      return newXp;
    });
  }, [level, levelUpXp]);

  const addBadge = useCallback((name: BadgeName) => {
    setBadges((currentBadges) => {
      if (!currentBadges.some(b => b.name === name)) {
        return [...currentBadges, { name, ...badgeDetails[name] }];
      }
      return currentBadges;
    });
  }, []);

  return (
    <GamificationContext.Provider
      value={{ xp, level, levelUpXp, badges, name, email, addXp, addBadge }}
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
