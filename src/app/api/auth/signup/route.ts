
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 1. Validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    let client;
    try {
      client = await clientPromise;
    } catch (error: any) {
        console.error("Failed to connect to the database", error);
        return NextResponse.json({ message: 'Database connection failed.', error: error.message }, { status: 500 });
    }
    
    const db = client.db();

    // 2. Check for existing user
    try {
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists.' }, { status: 409 });
        }
    } catch (error: any) {
        console.error("Failed to check for existing user", error);
        return NextResponse.json({ message: 'Error checking for existing user.', error: error.message }, { status: 500 });
    }

    // 3. Hash password
    let hashedPassword;
    try {
        hashedPassword = await hash(password, 10);
    } catch (error: any) {
        console.error("Failed to hash password", error);
        return NextResponse.json({ message: 'Error hashing password.', error: error.message }, { status: 500 });
    }

    // 4. Insert new user
    try {
        const result = await db.collection('users').insertOne({
            name,
            email,
            password: hashedPassword,
            level: 1,
            xp: 0,
            badges: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return NextResponse.json({ message: 'User created successfully.', userId: result.insertedId }, { status: 201 });
    } catch (error: any) {
        console.error("Failed to insert user", error);
        return NextResponse.json({ message: 'Error creating user.', error: error.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error("An unexpected error occurred during signup:", error);
    return NextResponse.json({ message: 'An internal server error occurred.', error: error.message }, { status: 500 });
  }
}
