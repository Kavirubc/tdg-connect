import nodemailer from 'nodemailer';
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Create the email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });
};

// Generate a "Daily Grind Season 3 - I'll be there" PNG image
export async function generateInviteImage(userName: string): Promise<{ filePath: string, publicUrl: string }> {
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

// Send email with the invite image
export async function sendInviteEmail(email: string, name: string, code?: string): Promise<string> {
    try {
        const transporter = createTransporter();

        // Generate the invite image
        const imageResult = await generateInviteImage(name);
        const { filePath, publicUrl } = imageResult;

        // Send email with the image attached
        await transporter.sendMail({
            from: `"Daily Grind Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Daily Grind Season 3 - Your Shareable Invitation!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333;">
          <div style="background-color: #f8f1e6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: #7b5c3d; text-align: center;">Welcome to Daily Grind Season 3!</h1>
            <p style="font-size: 16px;">Hi ${name},</p>
            <p style="font-size: 16px;">Thank you for registering for Daily Grind Season 3! We're excited to have you join our community.</p>
            <p style="font-size: 16px; font-weight: bold;">Your unique code: <span style="color: #7b5c3d; background-color: #e9dcc9; padding: 5px 10px; border-radius: 5px;">${code || Math.floor(1000 + Math.random() * 9000)}</span></p>
            <p style="font-size: 16px;">Use this code to connect with other members of the community.</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px;">
            <h2 style="color: #333333; text-align: center;">Share Your Excitement!</h2>
            <p style="font-size: 16px;">We've attached a special image for you to share on social media. Let everyone know you'll be at Daily Grind Season 3!</p>
            <p style="font-size: 16px;">Simply download the attached image and post it on your favorite social platform with the hashtag <strong>#DailyGrindS3</strong>.</p>
            <div style="text-align: center; margin: 20px 0;">
              <img src="cid:unique-invite-image" alt="Daily Grind Season 3 Invitation" style="max-width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #777777; font-size: 14px;">
            <p>We look forward to seeing you at the event!</p>
            <p>The Daily Grind Team</p>
          </div>
        </div>
      `,
            attachments: [
                {
                    filename: 'daily-grind-invitation.png',
                    path: filePath,
                    cid: 'unique-invite-image' // This embeds the image in the email body
                }
            ]
        });

        // Return the public URL of the image
        return publicUrl;

    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
