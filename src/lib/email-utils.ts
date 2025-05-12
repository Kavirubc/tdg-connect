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

    // Fill background with a gradient using the application color scheme
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#7bb5d3'); // primary color
    gradient.addColorStop(1, '#5a95b5'); // primary-dark color
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add a textured overlay pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = 40 + Math.random() * 60;
        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius / 1.5, Math.random() * Math.PI, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Add an inner card with rounded corners
    const margin = 80;
    const cornerRadius = 20;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

    // Draw rounded rectangle (manually since roundRect is not available)
    ctx.beginPath();
    ctx.moveTo(margin + cornerRadius, margin);
    ctx.lineTo(size - margin - cornerRadius, margin);
    ctx.arcTo(size - margin, margin, size - margin, margin + cornerRadius, cornerRadius);
    ctx.lineTo(size - margin, size - margin - cornerRadius);
    ctx.arcTo(size - margin, size - margin, size - margin - cornerRadius, size - margin, cornerRadius);
    ctx.lineTo(margin + cornerRadius, size - margin);
    ctx.arcTo(margin, size - margin, margin, size - margin - cornerRadius, cornerRadius);
    ctx.lineTo(margin, margin + cornerRadius);
    ctx.arcTo(margin, margin, margin + cornerRadius, margin, cornerRadius);
    ctx.closePath();
    ctx.fill();

    // Add a subtle shadow to the card
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    // Add decorative accent line at the top
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.moveTo(size * 0.2, size * 0.25);
    ctx.lineTo(size * 0.8, size * 0.25);
    ctx.strokeStyle = '#d1b89c'; // accent color
    ctx.lineWidth = 5;
    ctx.stroke();

    // Add title with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = '#3c3c3c'; // foreground color
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DAILY GRIND', size / 2, size / 3);

    ctx.font = 'bold 100px Arial';
    ctx.fillStyle = '#d1b89c'; // accent color
    ctx.fillText('SEASON 3', size / 2, size / 3 + 110);

    // Remove shadow for other text
    ctx.shadowColor = 'transparent';

    // Add decorative accent line after the title
    ctx.beginPath();
    ctx.moveTo(size * 0.3, size / 3 + 150);
    ctx.lineTo(size * 0.7, size / 3 + 150);
    ctx.strokeStyle = '#7bb5d3'; // primary color
    ctx.lineWidth = 3;
    ctx.stroke();

    // Add main text
    ctx.font = 'bold 70px Arial';
    ctx.fillStyle = '#5a95b5'; // primary-dark color
    ctx.fillText("I'LL BE THERE", size / 2, size / 2 + 50);

    // Add user name
    ctx.fillStyle = '#d1b89c'; // accent color
    ctx.font = 'bold 50px Arial';
    ctx.fillText(`${userName}`, size / 2, size / 2 + 150);

    // Add event details with improved formatting and style
    // Event date and time with a highlight box
    const dateTimeText = 'May 27th  |  4.00PM';
    const dateTimeWidth = ctx.measureText(dateTimeText).width;

    // Draw highlight box for date/time (manually drawing rounded rectangle)
    ctx.fillStyle = '#e6d7c4'; // accent-light color
    const boxPadding = 30;
    const boxHeight = 70;
    const boxY = size - 190;
    const boxX = (size - dateTimeWidth) / 2 - boxPadding;
    const boxWidth = dateTimeWidth + boxPadding * 2;
    const boxRadius = 15;

    ctx.beginPath();
    ctx.moveTo(boxX + boxRadius, boxY - boxHeight / 2);
    ctx.lineTo(boxX + boxWidth - boxRadius, boxY - boxHeight / 2);
    ctx.arcTo(boxX + boxWidth, boxY - boxHeight / 2, boxX + boxWidth, boxY - boxHeight / 2 + boxRadius, boxRadius);
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight / 2 - boxRadius);
    ctx.arcTo(boxX + boxWidth, boxY + boxHeight / 2, boxX + boxWidth - boxRadius, boxY + boxHeight / 2, boxRadius);
    ctx.lineTo(boxX + boxRadius, boxY + boxHeight / 2);
    ctx.arcTo(boxX, boxY + boxHeight / 2, boxX, boxY + boxHeight / 2 - boxRadius, boxRadius);
    ctx.lineTo(boxX, boxY - boxHeight / 2 + boxRadius);
    ctx.arcTo(boxX, boxY - boxHeight / 2, boxX + boxRadius, boxY - boxHeight / 2, boxRadius);
    ctx.closePath();
    ctx.fill();

    // Date and time text
    ctx.fillStyle = '#3c3c3c'; // foreground color
    ctx.font = 'bold 44px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'transparent';
    ctx.fillText(dateTimeText, size / 2, boxY + 15);

    // Event location with icon
    ctx.fillStyle = '#5a95b5'; // primary-dark color
    ctx.font = 'bold 36px Arial';
    ctx.fillText('At Sysco Labs', size / 2, size - 100);

    // Add an artistic decorative element
    ctx.strokeStyle = '#d1b89c'; // accent color
    ctx.lineWidth = 2;

    // Draw a coffee cup icon
    const cupX = size / 2;
    const cupY = size - 270;
    const cupSize = 30;

    // Cup body (manually drawing rounded rectangle)
    ctx.beginPath();
    ctx.moveTo(cupX - cupSize, cupY - cupSize);
    ctx.lineTo(cupX + cupSize, cupY - cupSize);
    ctx.lineTo(cupX + cupSize, cupY + cupSize * 0.5 - 10);
    ctx.arcTo(cupX + cupSize, cupY + cupSize * 0.5, cupX + cupSize - 10, cupY + cupSize * 0.5, 10);
    ctx.lineTo(cupX - cupSize + 10, cupY + cupSize * 0.5);
    ctx.arcTo(cupX - cupSize, cupY + cupSize * 0.5, cupX - cupSize, cupY + cupSize * 0.5 - 10, 10);
    ctx.closePath();
    ctx.stroke();

    // Cup handle
    ctx.beginPath();
    ctx.arc(cupX + cupSize, cupY - cupSize / 2, cupSize / 2, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Steam
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cupX - cupSize / 2 + i * cupSize / 2, cupY - cupSize * 1.5);
        ctx.bezierCurveTo(
            cupX - cupSize + i * cupSize / 2, cupY - cupSize * 2,
            cupX - cupSize / 2 + i * cupSize / 2, cupY - cupSize * 2,
            cupX - cupSize / 2 + i * cupSize / 2, cupY - cupSize * 2.5
        );
        ctx.stroke();
    }

    // Add the generation date in small font at the bottom
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    ctx.fillStyle = '#888888';
    ctx.font = 'italic 20px Arial';
    ctx.fillText(formattedDate, size / 2, size - 40);

    // Save to the public folder
    const publicDir = path.join(process.cwd(), 'public', 'invites');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    const fileName = `invite_${Date.now()}.png`;
    const filePath = path.join(publicDir, fileName);
    // Always ensure the publicPath has the correct /invites/ prefix
    const publicPath = `/invites/${fileName}`;

    // Write the image to the file system
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);

    // Verify the file was written successfully
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`Generated image saved to ${filePath} (${stats.size} bytes) with public URL ${publicPath}`);
    } else {
        console.error(`Failed to save image to ${filePath}`);
    }

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
        // Get the correctly formatted URL from the image generation result
        const { publicUrl } = imageResult;

        console.log(`Successfully generated invite image: ${publicUrl}`);

        // Generate a code if not provided
        const inviteCode = code || Math.floor(1000 + Math.random() * 9000).toString();

        console.log(`Successfully generated invitation image: ${publicUrl}`);

        return {
            publicUrl,
            code: inviteCode
        };
    } catch (error) {
        console.error('Error generating invite:', error);
        throw error;
    }
}
