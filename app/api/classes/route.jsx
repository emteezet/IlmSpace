import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Class from '@/models/Class';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded || decoded.role !== 'teacher') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { name, description, schoolId, category } = await req.json();

        if (!name || name.length < 3) return NextResponse.json({ error: 'Class name too short' }, { status: 400 });
        if (!schoolId) return NextResponse.json({ error: 'School ID required' }, { status: 400 });

        const newClass = await Class.create({
            name,
            description,
            school: schoolId,
            teacher: decoded.id,
            category: category || 'General',
        });

        return NextResponse.json({ success: true, class: newClass }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const schoolId = searchParams.get('schoolId');
        const studentId = searchParams.get('studentId');
        const joined = searchParams.get('joined');
        const search = searchParams.get('search');
        const category = searchParams.get('category');

        await dbConnect();

        let query = {};
        if (schoolId) query.school = schoolId;
        if (category) query.category = category;
        if (studentId) {
            if (joined === 'true') {
                query.students = studentId;
            } else {
                query.students = { $ne: studentId };
            }
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const classes = await Class.find(query).populate('teacher', 'name');
        return NextResponse.json({ success: true, classes });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
