
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // To log out, we just need to delete the session cookie.
    cookies().delete('token');
    
    return NextResponse.json({ message: 'Logout successful.' }, { status: 200 });
  } catch (error: any) {
    console.error("An unexpected error occurred during logout:", error);
    return NextResponse.json({ message: 'An internal server error occurred.', error: error.message }, { status: 500 });
  }
}
