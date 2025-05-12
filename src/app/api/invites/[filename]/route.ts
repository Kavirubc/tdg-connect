import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// This route will directly serve invitation images
export async function GET(
    request: NextRequest,
    context: any
) {
    try {
        const filename = context.params.filename;

        // Validate filename to prevent directory traversal
        if (!filename.match(/^[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp)$/)) {
            return new NextResponse('Invalid filename', { status: 400 });
        }

        // Construct the file path
        const filePath = path.join(process.cwd(), 'public', 'invites', filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(`Image not found: ${filePath}`);
            return new NextResponse('Image not found', { status: 404 });
        }

        // Read the file
        const fileBuffer = fs.readFileSync(filePath);

        // Determine content type based on file extension
        let contentType = 'image/png'; // Default
        if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
            contentType = 'image/jpeg';
        } else if (filename.endsWith('.webp')) {
            contentType = 'image/webp';
        }

        // Return the image with proper headers
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // Cache for 1 day
            }
        });
    } catch (error) {
        console.error('Error serving invitation image:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
