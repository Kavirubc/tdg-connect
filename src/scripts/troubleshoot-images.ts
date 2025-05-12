import fs from 'fs';
import path from 'path';
import { generateInviteImage } from '@/lib/email-utils';

async function main() {
    try {
        console.log('===== TDG-CONNECT IMAGE PATH TROUBLESHOOTER =====');

        // 1. Check if public directory exists
        const publicDir = path.join(process.cwd(), 'public');
        const invitesDir = path.join(publicDir, 'invites');

        console.log(`Current working directory: ${process.cwd()}`);
        console.log(`Public directory path: ${publicDir}`);
        console.log(`Public directory exists: ${fs.existsSync(publicDir)}`);
        console.log(`Invites directory path: ${invitesDir}`);
        console.log(`Invites directory exists: ${fs.existsSync(invitesDir)}`);

        // 2. If invites directory doesn't exist, create it
        if (!fs.existsSync(invitesDir)) {
            console.log('Creating invites directory...');
            fs.mkdirSync(invitesDir, { recursive: true });
            console.log(`Invites directory created: ${fs.existsSync(invitesDir)}`);
        }

        // 3. Generate a test image
        console.log('\nGenerating test image...');
        const testImage = await generateInviteImage('Test User');
        console.log(`Test image generated at: ${testImage.filePath}`);
        console.log(`Public URL path: ${testImage.publicUrl}`);

        // 4. Verify all files in invites directory
        if (fs.existsSync(invitesDir)) {
            const files = fs.readdirSync(invitesDir);
            console.log(`\nFound ${files.length} files in invites directory:`);

            for (const file of files) {
                const filePath = path.join(invitesDir, file);
                const stats = fs.statSync(filePath);

                // Check permissions
                let readPermission = false;
                let writePermission = false;

                try {
                    fs.accessSync(filePath, fs.constants.R_OK);
                    readPermission = true;
                } catch (e) { }

                try {
                    fs.accessSync(filePath, fs.constants.W_OK);
                    writePermission = true;
                } catch (e) { }

                console.log(`- ${file} (${stats.size} bytes, created: ${stats.birthtime.toLocaleString()}, read: ${readPermission ? 'yes' : 'no'}, write: ${writePermission ? 'yes' : 'no'})`);
            }
        }

        // 5. Write a simple HTML test file
        const htmlTestPath = path.join(invitesDir, 'test.html');
        const testHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Image Test</title>
</head>
<body>
    <h1>Image Test</h1>
    <p>Generated at: ${new Date().toLocaleString()}</p>
    <h2>Built-in images:</h2>
    <img src="/next.svg" alt="Next.js Logo" width="200" /><br>
    <img src="/vercel.svg" alt="Vercel Logo" width="200" /><br>
    
    <h2>Generated invitation image:</h2>
    <img src="${testImage.publicUrl}" alt="Test Invitation" width="400" /><br>
    
    <p>If you can see both images above, everything is working correctly.</p>
    <p>Public URL path: ${testImage.publicUrl}</p>
</body>
</html>`;

        fs.writeFileSync(htmlTestPath, testHtml);
        console.log(`\nWrote test HTML file to: ${htmlTestPath}`);
        console.log(`Test this by visiting: /invites/test.html`);

        // 6. Check for common issues
        console.log('\nChecking for common issues:');

        // Check for direct /invites/ path resolution
        if (testImage.publicUrl && !testImage.publicUrl.startsWith('/invites/')) {
            console.log('⚠️ WARNING: The public URL does not start with /invites/');
        } else {
            console.log('✓ Public URL format is correct (starts with /invites/)');
        }

        // Check for Node.js version
        console.log(`Node.js version: ${process.version}`);

        // Check if Next.js is in production mode
        console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

        console.log('\n===== TROUBLESHOOTING COMPLETE =====');
        console.log('Try accessing the image directly via the public URL path.');
        console.log('Check the generated test page at: /invites/test.html');

    } catch (error) {
        console.error('Error in troubleshooter:', error);
    }
}

main();
