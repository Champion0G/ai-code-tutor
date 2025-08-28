
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';
import { User } from '@/models/user';
import { safeError } from '@/lib/safe-error';
import { AI_USAGE_LIMIT_GUEST } from '@/contexts/gamification-context';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getUser(userId: string): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db("ai-code-tutor");
    const usersCollection = db.collection<User>('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    return user;
}

async function updateUserUsage(userId: string, updates: Partial<User>): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db("ai-code-tutor");
    const usersCollection = db.collection<User>('users');
    const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );
    return result;
}


export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required. No token found.' }, { status: 401 });
    }
    
    let decoded;
    try {
      decoded = await jwtVerify(token, JWT_SECRET);
    } catch (err) {
      const safe = safeError(err);
      // Log the actual error for debugging, but return a generic message.
      console.error("JWT Verification Error:", safe.message);
      return NextResponse.json({ message: 'Invalid token. Please log in again.' }, { status: 401 });
    }
    
    const userId = decoded.payload.userId as string;
    if (!userId) {
        return NextResponse.json({ message: 'Invalid token payload.' }, { status: 401 });
    }

    let user = await getUser(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // For registered users, we just increment their usage count but do not enforce a limit.
    // The limit is now effectively infinite. We still track usage for analytics.
    const newCount = (user.aiUsageCount || 0) + 1;
    const updatedUser = await updateUserUsage(userId, { aiUsageCount: newCount });

    if (!updatedUser) {
      return NextResponse.json({ message: 'Failed to update user usage.' }, { status: 500 });
    }

    const { password, ...userResponse } = updatedUser;
    return NextResponse.json({ 
        message: 'Usage updated.', 
        limitReached: false, // Always false for registered users now
        user: userResponse
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to update usage:', error);
    const safe = safeError(error);
    return NextResponse.json({ message: 'An internal server error occurred.', error: safe.message }, { status: 500 });
  }
}
