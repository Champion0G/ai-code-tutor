
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hash } from 'bcryptjs';
import { safeError } from '@/lib/safe-error';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    let client;
    try {
      client = await clientPromise;
    } catch (error) {
        console.error("Failed to connect to the database", error);
        const safe = safeError(error);
        return NextResponse.json({ message: 'Database connection failed.', error: safe.message }, { status: 500 });
    }
    
    const db = client.db("ai-code-tutor");

    try {
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists.' }, { status: 409 });
        }
    } catch (error) {
        console.error("Failed to check for existing user", error);
        const safe = safeError(error);
        return NextResponse.json({ message: 'Error checking for existing user.', error: safe.message }, { status: 500 });
    }

    let hashedPassword;
    try {
        hashedPassword = await hash(password, 10);
    } catch (error) {
        console.error("Failed to hash password", error);
        const safe = safeError(error);
        return NextResponse.json({ message: 'Error hashing password.', error: safe.message }, { status: 500 });
    }

    try {
        const now = new Date();
        const result = await db.collection('users').insertOne({
            name,
            email,
            password: hashedPassword,
            level: 1,
            xp: 0,
            badges: [],
            createdAt: now,
            updatedAt: now,
            aiUsageCount: 0,
            aiUsageLastReset: now,
        });
        return NextResponse.json({ message: 'User created successfully.', userId: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error("Failed to insert user", error);
        const safe = safeError(error);
        return NextResponse.json({ message: 'Error creating user.', error: safe.message }, { status: 500 });
    }

  } catch (error) {
    console.error("An unexpected error occurred during signup:", error);
    const safe = safeError(error);
    return NextResponse.json({ message: 'An internal server error occurred.', error: safe.message }, { status: 500 });
  }
}
