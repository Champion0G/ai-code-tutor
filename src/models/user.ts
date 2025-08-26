
import { ObjectId } from 'mongodb';
import type { BadgeName } from '@/contexts/gamification-context';

// Simplified User model for now, based on design document
// We will expand this later to include all the fields from the design.
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
}
