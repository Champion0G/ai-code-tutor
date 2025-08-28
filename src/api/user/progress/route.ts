
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { User } from '@/models/user';
import { safeError } from '@/lib/safe-error';

export async function POST(req: Request) {
  try {
    const { level, xp, badges, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
    }

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
