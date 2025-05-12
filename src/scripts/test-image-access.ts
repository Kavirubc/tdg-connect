import fs from 'fs';
import path from 'path';
import { generateInviteImage } from '@/lib/email-utils';

async function testImageGeneration() {
    try {
        console.log('Testing invitation image generation...');

        // Generate a test image
        const { filePath, publicUrl } = await generateInviteImage('Test User');

        console.log('Image generation successful.');
        console.log('File path:', filePath);
        console.log('Public URL:', publicUrl);

        // Verify file existence
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`File exists and is ${stats.size} bytes`);
        } else {
            console.error('File does not exist after generation!');
        }

        // Check permissions
        try {
            const publicDir = path.join(process.cwd(), 'public', 'invites');
            fs.accessSync(publicDir, fs.constants.R_OK | fs.constants.W_OK);
            console.log('Public directory has correct permissions');
        } catch (err) {
            console.error('Public directory permission issue:', err);
        }

    } catch (error) {
        console.error('Image generation failed:', error);
    }
}

testImageGeneration();
