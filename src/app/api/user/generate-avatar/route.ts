import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { saveAvatarImageFromUrl } from '@/lib/email-utils';
import OpenAI from "openai";
import fs from "fs";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { prompt } = await req.json();
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.avatarPromptAttempts >= 3) {
        return NextResponse.json({ error: 'You have reached the maximum number of avatar generations.' }, { status: 403 });
    }

    // Use OpenAI Node SDK for image generation with gpt-image-1 (no background param)
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let result;
    const newPrompt = `Generate a unique avatar for a user named ${user.name} with the following details: ${prompt}`;
    try {
        result = await openai.images.generate({
            model: "gpt-image-1",
            prompt: newPrompt,
        });
    } catch (err: any) {
        // Log the error for debugging
        console.error('OpenAI image generation error:', err?.response?.data || err);
        return NextResponse.json({ error: 'Failed to generate avatar.' }, { status: 500 });
    }
    const image_base64 = result?.data?.[0]?.b64_json;
    if (!image_base64) {
        return NextResponse.json({ error: 'No image returned from OpenAI.' }, { status: 500 });
    }
    // Save avatar image to public/userAvatar and store the public path
    const fileName = `avatar_${user._id.toString()}_${Date.now()}.png`;
    const filePath = `${process.cwd()}/public/userAvatar/${fileName}`;
    const publicPath = `/userAvatar/${fileName}`;
    const image_bytes = Buffer.from(image_base64, "base64");
    fs.writeFileSync(filePath, image_bytes);
    user.avatarUrl = publicPath;
    user.avatarPromptAttempts = (user.avatarPromptAttempts || 0) + 1;
    await user.save();
    return NextResponse.json({ avatarUrl: user.avatarUrl, attempts: user.avatarPromptAttempts });
}
