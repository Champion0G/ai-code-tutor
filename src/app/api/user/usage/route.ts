
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';
import { User } from '@/models/user';
import { safeError } from '@/lib/safe-error';
import { AI_USAGE_LIMIT_REGISTERED } from '@/contexts/gamification-context';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getUser(userId: string): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db("ai-code-tutor");
    const usersCollection = db.collection<User>('users');
    return usersCollection.findOne({ _id: new ObjectId(userId) });
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
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }
    
    let decoded;
    try {
      decoded = await jwtVerify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
    }
    
    const userId = decoded.payload.userId as string;
    let user = await getUser(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const now = new Date();
    const lastReset = new Date(user.aiUsageLastReset || 0);
    const timeSinceReset = now.getTime() - lastReset.getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    // Reset if it's been more than a day
    if (timeSinceReset > oneDay) {
        user.aiUsageCount = 0;
        user.aiUsageLastReset = now;
        user = await updateUserUsage(userId, { aiUsageCount: 0, aiUsageLastReset: now });
        if (!user) return NextResponse.json({ message: 'User not found after reset.' }, { status: 404 });
    }
    
    // Check if usage limit is reached
    if (user.aiUsageCount >= AI_USAGE_LIMIT_REGISTERED) {
      return NextResponse.json({ 
        message: 'Daily AI usage limit reached.', 
        limitReached: true,
        usage: { count: user.aiUsageCount, limit: AI_USAGE_LIMIT_REGISTERED }
      }, { status: 429 });
    }

    // Increment usage
    const newCount = user.aiUsageCount + 1;
    const updatedUser = await updateUserUsage(userId, { aiUsageCount: newCount });

    if (!updatedUser) {
      return NextResponse.json({ message: 'Failed to update user usage.' }, { status: 500 });
    }

    const { password, ...userResponse } = updatedUser;
    return NextResponse.json({ 
        message: 'Usage updated.', 
        limitReached: false, 
        user: userResponse
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to update usage:', error);
    const safe = safeError(error);
    return NextResponse.json({ message: 'An internal server error occurred.', error: safe.message }, { status: 500 });
  }
}
