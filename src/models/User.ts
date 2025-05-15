import { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // 4-digit code
    phone: { type: String, required: true },
    nic: { type: String, required: true }, // National Identity Card
    organization: { type: String, required: true },
    inviteImageUrl: { type: String }, // URL to the invitation image
    interests: { type: [String], default: [] },
    facts: { type: [String], default: [] },
    avatarUrl: { type: String }, // URL to the generated avatar image
    avatarPromptAttempts: { type: Number, default: 0 }, // Number of avatar generations
    connections: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        isDisconnected: { type: Boolean, default: false }
    }],
    seeYouSoon: [{ type: String }], // user IDs marked as "see you soon"
}, { timestamps: true });

export default models.User || model('User', UserSchema);
