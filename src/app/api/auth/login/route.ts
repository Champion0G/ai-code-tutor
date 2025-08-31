
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { safeError } from '@/lib/safe-error';

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
    } catch (error) {
        console.error("Failed to connect to the database", error);
        const safe = safeError(error);
        return NextResponse.json({ message: 'Database connection failed.', error: safe.message }, { status: 500 });
    }
    
    const db = client.db("ai-code-tutor");

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }
    
    const token = await new SignJWT({ userId: user._id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
    });

    const { password: _, ...userResponse } = user;

    return NextResponse.json({ message: 'Login successful.', user: userResponse }, { status: 200 });
  } catch (error) {
    console.error("An unexpected error occurred during login:", error);
    const safe = safeError(error);
    return NextResponse.json({ message: 'An internal server error occurred.', error: safe.message }, { status: 500 });
  }
}
