
import { ObjectId } from 'mongodb';
import type { BadgeName } from '@/contexts/gamification-context';

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password?: string; // Will be stripped out for client-side objects
  level: number;
  xp: number;
  badges: BadgeName[];
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  aiUsageCount: number;
  aiUsageLastReset: Date;
}
