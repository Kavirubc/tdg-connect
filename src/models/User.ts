import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // 4-digit code
    interests: { type: [String], default: [] },
    facts: { type: [String], default: [] },
}, { timestamps: true });

export default models.User || model('User', UserSchema);
