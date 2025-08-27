
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }
    
    let client;
    try {
        client = await clientPromise;
    } catch (error: any) {
        console.error("Failed to connect to the database", error);
        return NextResponse.json({ message: 'Database connection failed.', error: error.message }, { status: 500 });
    }
    
    const db = client.db("ai-code-tutor");

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }
    
    // Create JWT
    const token = await new SignJWT({ userId: user._id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h') // Token expires in 1 hour
      .sign(JWT_SECRET);

    // Set cookie
    cookies().set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 hour
        path: '/',
    });

    // Don't send password back to the client
    const { password: _, ...userResponse } = user;

    return NextResponse.json({ message: 'Login successful.', user: userResponse }, { status: 200 });
  } catch (error: any) {
    console.error("An unexpected error occurred during login:", error);
    return NextResponse.json({ message: 'An internal server error occurred.', error: error.message }, { status: 500 });
  }
}
