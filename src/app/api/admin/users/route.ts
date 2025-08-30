
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { safeError } from '@/lib/safe-error';
import { User } from '@/models/user';

// In a real application, this endpoint should be protected by authentication and authorization
// to ensure only administrators can access it.

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ai-code-tutor");
    const usersCollection = db.collection<User>('users');

    // Fetch all users, but exclude the password field for security.
    const users = await usersCollection.find({}, {
        projection: { password: 0, resetPasswordToken: 0, resetPasswordExpires: 0 }
    }).toArray();

    return NextResponse.json({ success: true, users }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch users:', error);
    const safe = safeError(error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.', error: safe.message }, { status: 500 });
  }
}
