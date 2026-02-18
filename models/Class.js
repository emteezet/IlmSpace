import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a class name'],
    },
    description: {
        type: String,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    category: {
        type: String,
        enum: ['Quran', 'Arabic', 'Fiqh', 'History', 'General'],
        default: 'General',
    },
    schedule: {
        day: String,
        time: String,
    },
}, { timestamps: true });

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);
