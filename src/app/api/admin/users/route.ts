
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import clientPromise from '@/lib/mongodb';
import { User } from '@/models/user';
import { ObjectId } from 'mongodb';
import { safeError } from '@/lib/safe-error';


const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;

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

        const client = await clientPromise;
        const db = client.db("ai-code-tutor");
        const usersCollection = db.collection<User>('users');

        const currentUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ message: 'Access Denied: You are not authorized to view this page.' }, { status: 403 });
        }
        
        const users = await usersCollection.find({}).project({ password: 0 }).toArray();

        return NextResponse.json({ users }, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch users:', error);
        const safe = safeError(error);
        return NextResponse.json({ message: 'An internal server error occurred.', error: safe.message }, { status: 500 });
    }
}
