
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';
import { User } from '@/models/user';
import { safeError } from '@/lib/safe-error';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

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
      const safe = safeError(err);
      return NextResponse.json({ message: 'Invalid token.', error: safe.message }, { status: 401 });
    }
    
    const userId = decoded.payload.userId as string;

    const { level, xp, badges } = await req.json();

    const client = await clientPromise;
    const db = client.db("ai-code-tutor");
    const usersCollection = db.collection<User>('users');

    const updateData: Partial<User> & { updatedAt: Date } = {
        updatedAt: new Date(),
    };

    if (level !== undefined) updateData.level = level;
    if (xp !== undefined) updateData.xp = xp;
    if (badges !== undefined) updateData.badges = badges;

    if (Object.keys(updateData).length === 1) {
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      if (!user) return NextResponse.json({ message: 'User not found.' }, { status: 404 });
      const { password, ...userResponse } = user;
      return NextResponse.json({ message: 'No progress data to update.', user: userResponse }, { status: 200 });
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const { password, ...updatedUser } = result;

    return NextResponse.json({ message: 'Progress updated successfully.', user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Failed to update progress:', error);
    const safe = safeError(error);
    return NextResponse.json({ message: 'An internal server error occurred.', error: safe.message }, { status: 500 });
  }
}
