
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { safeError } from '@/lib/safe-error';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    
    return NextResponse.json({ message: 'Logout successful.' }, { status: 200 });
  } catch (error) {
    console.error("An unexpected error occurred during logout:", error);
    const safe = safeError(error);
    return NextResponse.json({ message: 'An internal server error occurred.', error: safe.message }, { status: 500 });
  }
}
