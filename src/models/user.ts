
import { ObjectId } from 'mongodb';

// Simplified User model for now, based on design document
// We will expand this later to include all the fields from the design.
export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password?: string; // Will be stripped out for client-side objects
  createdAt: Date;
  updatedAt: Date;
}
