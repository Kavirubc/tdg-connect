import mongoose, { Schema, Document, Model } from 'mongoose';

export interface QuestionDocument extends Document {
    heading: string;
    question: string;
    userId: string;
    userName: string;
    createdAt: Date;
    anonymous: boolean;
}

const QuestionSchema: Schema = new Schema({
    heading: { type: String, required: true },
    question: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    anonymous: { type: Boolean, default: false },
});

const Question: Model<QuestionDocument> =
    mongoose.models.Question || mongoose.model<QuestionDocument>('Question', QuestionSchema);

export default Question;
