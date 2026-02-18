import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req) {
    try {
        // Add timeout for database connection
        const connectionPromise = dbConnect();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database connection timeout')), 10000)
        );

        await Promise.race([connectionPromise, timeoutPromise]);

        const { name, email, password, role } = await req.json();

        // Input Validation
        if (!name || name.length < 2) return NextResponse.json({ error: 'Name too short' }, { status: 400 });
        if (!email || !email.includes('@')) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        if (!password || password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        if (!['teacher', 'student'].includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
        });

        const token = signToken({ id: user._id, role: user.role });

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
