import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Ensure the invites directory exists
function ensureInvitesDirectory() {
    const publicDir = path.join(process.cwd(), 'public', 'invites');
    if (!fs.existsSync(publicDir)) {
        console.log('Creating invites directory at:', publicDir);
        fs.mkdirSync(publicDir, { recursive: true });
    }
}

// Generate a "Daily Grind Season 3 - I'll be there" PNG image
export async function generateInviteImage(userName: string): Promise<{ filePath: string, publicUrl: string }> {
    // Ensure the invites directory exists
    ensureInvitesDirectory();

    // Create a canvas (1x1 aspect ratio)
    const size = 1200; // 1200x1200 px for better quality on social media
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fill background with a gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#333333');
    gradient.addColorStop(1, '#111111');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add some decorative elements (coffee beans pattern)
    ctx.fillStyle = 'rgba(100, 70, 50, 0.1)';
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = 20 + Math.random() * 30;
        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius / 2, Math.random() * Math.PI, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Add a border
    ctx.strokeStyle = '#c0a080';
    ctx.lineWidth = 10;
    ctx.strokeRect(40, 40, size - 80, size - 80);

    // Add title with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DAILY GRIND', size / 2, size / 3 - 40);

    ctx.font = 'bold 100px Arial';
    ctx.fillText('SEASON 3', size / 2, size / 3 + 70);

    // Remove shadow for other text
    ctx.shadowColor = 'transparent';

    // Add main text
    ctx.font = 'bold 70px Arial';
    ctx.fillText("I'LL BE THERE", size / 2, size / 2 + 50);

    // Add user name
    ctx.fillStyle = '#c0a080';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(`${userName}`, size / 2, size / 2 + 150);

    // Add the current date at the bottom
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '30px Arial';
    ctx.fillText(formattedDate, size / 2, size - 80);

    // Save to the public folder
    const publicDir = path.join(process.cwd(), 'public', 'invites');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    const fileName = `invite_${Date.now()}.png`;
    const filePath = path.join(publicDir, fileName);
    const publicPath = `/invites/${fileName}`;

    // Write the image to the file system
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);

    return { filePath, publicUrl: publicPath };
}

// Generate invite without sending email
export async function generateUserInvite(name: string, code?: string): Promise<{ publicUrl: string, code: string }> {
    try {
        // Ensure directories exist first
        ensureInvitesDirectory();

        console.log(`Generating invite image for user: ${name}, code: ${code || 'not provided'}`);

        // Generate the invite image
        const imageResult = await generateInviteImage(name);
        const { publicUrl } = imageResult;

        console.log(`Successfully generated invite image: ${publicUrl}`);

        // Generate a code if not provided
        const inviteCode = code || Math.floor(1000 + Math.random() * 9000).toString();

        return {
            publicUrl,
            code: inviteCode
        };
    } catch (error) {
        console.error('Error generating invite:', error);
        throw error;
    }
}
