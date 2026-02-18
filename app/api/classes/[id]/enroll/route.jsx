import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Class from '@/models/Class';
import { verifyToken } from '@/lib/auth';

export async function POST(req, { params }) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded || decoded.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const classId = params.id;

        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            { $addToSet: { students: decoded.id } },
            { new: true }
        );

        if (!updatedClass) {
            return NextResponse.json({ error: 'Class not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, class: updatedClass });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
