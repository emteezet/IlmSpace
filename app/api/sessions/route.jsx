import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded || decoded.role !== 'teacher') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { title, classId, startTime } = await req.json();

        const session = await Session.create({
            title,
            class: classId,
            teacher: decoded.id,
            startTime: startTime ? new Date(startTime) : new Date(),
            status: 'scheduled',
        });

        return NextResponse.json({ success: true, session }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const classId = searchParams.get('classId');
        const status = searchParams.get('status');
        const studentId = searchParams.get('studentId');

        await dbConnect();

        let query = {};
        if (classId) query.class = classId;
        if (status) query.status = status;

        if (studentId) {
            const Class = (await import('@/models/Class')).default;
            const joinedClasses = await Class.find({ students: studentId }).select('_id');
            const classIds = joinedClasses.map(c => c._id);
            query.class = { $in: classIds };
        }

        const sessions = await Session.find(query)
            .populate('teacher', 'name')
            .populate('speakers', 'name')
            .populate('handRaises', 'name')
            .sort({ startTime: -1 });
        return NextResponse.json({ success: true, sessions });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
