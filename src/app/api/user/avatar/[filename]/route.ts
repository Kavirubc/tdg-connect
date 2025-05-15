import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Serves avatar images from /public/userAvatar as an API fallback
export async function GET(
    req: NextRequest,
    context: any
) {
    const filename = context.params.filename;
    if (!filename) {
        return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }
    // Only allow png or jpg for safety
    if (!/^[\w\-\.]+\.(png|jpg|jpeg)$/i.test(filename)) {
        return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }
    const filePath = path.join(process.cwd(), 'public', 'userAvatar', filename);
    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
    return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
    });
}
