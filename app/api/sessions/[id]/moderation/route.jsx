import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import { verifyToken } from '@/lib/auth';

export async function POST(req, { params }) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const { action } = await req.json();
        const sessionId = params.id;

        let update = {};
        const session = await Session.findById(sessionId);
        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

        // Signaling ACTIONS
        switch (action) {
            case 'hand-raise':
                update = { $addToSet: { handRaises: decoded.id } };
                break;
            case 'hand-cancel':
                update = { $pull: { handRaises: decoded.id } };
                break;
            case 'promote':
                // Only teacher can promote
                if (session.teacher.toString() !== decoded.id) {
                    return NextResponse.json({ error: 'Only host can promote' }, { status: 403 });
                }
                const { userId } = await req.json(); // Re-parsing for host actions
                update = {
                    $addToSet: { speakers: userId },
                    $pull: { handRaises: userId }
                };
                break;
            case 'demote':
                if (session.teacher.toString() !== decoded.id) {
                    return NextResponse.json({ error: 'Only host can demote' }, { status: 403 });
                }
                const { userId: demoteId } = await req.json();
                update = { $pull: { speakers: demoteId } };
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const updatedSession = await Session.findByIdAndUpdate(sessionId, update, { new: true })
            .populate('teacher', 'name')
            .populate('speakers', 'name')
            .populate('handRaises', 'name');

        return NextResponse.json({ success: true, session: updatedSession });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Special case: host might need to promote/demote with different body
// Let's use a unified POST handler for simplicity since it's an internal signaling API
