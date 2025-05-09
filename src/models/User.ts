import { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // 4-digit code
    phone: { type: String, required: true },
    interests: { type: [String], default: [] },
    facts: { type: [String], default: [] },
    connections: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        isDisconnected: { type: Boolean, default: false }
    }],
}, { timestamps: true });

export default models.User || model('User', UserSchema);
