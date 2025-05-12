// This script checks if the canvas library and invitation generation is working correctly
import { generateInviteImage } from '../lib/email-utils';
import fs from 'fs';
import path from 'path';

async function checkCanvasAndInvites() {
    console.log('Testing invitation image generation...');

    try {
        // Check if the public/invites directory exists
        const invitesDir = path.join(process.cwd(), 'public', 'invites');
        if (!fs.existsSync(invitesDir)) {
            console.log(`Creating invites directory at: ${invitesDir}`);
            fs.mkdirSync(invitesDir, { recursive: true });
        } else {
            console.log(`Invites directory exists at: ${invitesDir}`);
        }

        // Try to generate a test invitation
        console.log('Generating test invitation image...');
        const result = await generateInviteImage('Test User');

        console.log('Successfully generated invitation image:');
        console.log('- File path:', result.filePath);
        console.log('- Public URL:', result.publicUrl);

        // Check if the file exists
        if (fs.existsSync(result.filePath)) {
            const stats = fs.statSync(result.filePath);
            console.log(`- File size: ${stats.size} bytes`);
            console.log('✅ Image generation is working correctly!');
        } else {
            console.error('❌ File was not created at the expected location.');
        }

    } catch (error: unknown) {
        console.error('❌ Error testing invitation generation:');
        console.error(error);

        // Additional hints for common errors
        if (error instanceof Error && error.message?.includes('node-canvas')) {
            console.error('\nPossible solution: Make sure node-canvas is properly installed:');
            console.error('  npm install canvas');
            console.error('  # or');
            console.error('  pnpm add canvas');

            // On Linux, might need additional libraries
            console.error('\nOn Linux systems, you might need to install additional dependencies:');
            console.error('  sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev');
        }
    }
}

checkCanvasAndInvites();
