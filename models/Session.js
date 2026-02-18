import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'ended'],
        default: 'scheduled',
    },
    startTime: Date,
    endTime: Date,
    recordingUrl: String,
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    handRaises: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    speakers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
