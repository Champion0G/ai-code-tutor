
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: Request) {
  try {
    // 1. Verify user is authenticated
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

    // 2. Get progress data from request body
    const { level, xp, badges } = await req.json();

    if (level === undefined || xp === undefined || badges === undefined) {
      return NextResponse.json({ message: 'Missing progress data.' }, { status: 400 });
    }

    // 3. Update user in database
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          level,
          xp,
          badges,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Progress updated successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Failed to update progress:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
