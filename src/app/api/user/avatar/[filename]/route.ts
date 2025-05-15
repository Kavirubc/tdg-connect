import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Serves avatar images from /public/userAvatar as an API fallback
export async function GET(
    req: NextRequest,
    context: any
) {
    // Make sure to await params as it's a Promise in Next.js App Router
    const params = await context.params;
    const filename = params.filename;
    if (!filename) {
        return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }
    // Only allow png or jpg for safety
    if (!/^[\w\-\.]+\.(png|jpg|jpeg)$/i.test(filename)) {
        return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }
    const filePath = path.join(process.cwd(), 'public', 'userAvatar', filename);
    
    // Improved error handling when file doesn't exist
    if (!fs.existsSync(filePath)) {
        console.error(`Avatar file not found: ${filePath}`);
        
        // Try to serve default avatar instead
        const defaultPath = path.join(process.cwd(), 'public', 'userAvatar', 'default.png');
        
        if (fs.existsSync(defaultPath)) {
            // Return default avatar if it exists
            const defaultBuffer = fs.readFileSync(defaultPath);
            return new NextResponse(defaultBuffer, {
                status: 200,
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                }
            });
        } else {
            // If default doesn't exist either, return error JSON
            return NextResponse.json({ 
                error: 'Avatar not found', 
                requestedFile: filename,
                searchPath: filePath
            }, { status: 404 });
        }
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
