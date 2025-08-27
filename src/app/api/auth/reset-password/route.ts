
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { safeError } from '@/lib/safe-error';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Token and password are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ai-code-tutor");

    const user = await db.collection('users').findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json({ message: 'Password reset token is invalid or has expired.' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    await db.collection('users').updateOne(
      { _id: new ObjectId(user._id) },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpires: "",
        },
      }
    );

    return NextResponse.json({ message: 'Password has been reset successfully.' }, { status: 200 });

  } catch (error) {
    console.error("Password reset error:", error);
    const safe = safeError(error);
    return NextResponse.json({ message: 'An internal server error occurred.', error: safe.message }, { status: 500 });
  }
}
