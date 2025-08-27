
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { randomBytes } from 'crypto';
import { ObjectId } from 'mongodb';
import { safeError } from '@/lib/safe-error';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ai-code-tutor");
    const users = db.collection('users');

    const user = await users.findOne({ email });

    if (!user) {
      // Don't reveal if a user exists or not
      return NextResponse.json({ message: 'If a user with that email exists, a reset link will be sent.' }, { status: 200 });
    }

    const resetToken = randomBytes(32).toString('hex');
    const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await users.updateOne(
      { _id: new ObjectId(user._id) },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: passwordResetExpires,
        },
      }
    );

    // In a real app, you would send an email here.
    // For this example, we'll just log it to the console.
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/reset-password?token=${resetToken}`;
    console.log(`Password reset link for ${email}: ${resetUrl}`);


    return NextResponse.json({ message: 'If a user with that email exists, a reset link will be sent.' }, { status: 200 });

  } catch (error) {
    console.error("Request password reset error:", error);
    const safe = safeError(error);
    return NextResponse.json({ message: 'An internal server error occurred.', error: safe.message }, { status: 500 });
  }
}
