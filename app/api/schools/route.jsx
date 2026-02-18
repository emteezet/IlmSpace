import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import School from '@/models/School';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded || decoded.role !== 'teacher') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { name, description } = await req.json();

        const school = await School.create({
            name,
            description,
            teacher: decoded.id,
        });

        return NextResponse.json({ success: true, school }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const schools = await School.find({ teacher: decoded.id });
        return NextResponse.json({ success: true, schools });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
