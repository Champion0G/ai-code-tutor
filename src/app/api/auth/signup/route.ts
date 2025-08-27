
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hash } from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 8) {
        return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(); // Use the default database from the connection string

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists.' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);

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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
