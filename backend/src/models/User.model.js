import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password_hash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['CITIZEN', 'AUTHORITY', 'EMERGENCY', 'ADMIN']
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null 
    }
}, {
    timestamps: true
});

export const User = mongoose.model("User", userSchema)  