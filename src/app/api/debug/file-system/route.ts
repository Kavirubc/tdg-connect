import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    try {
        const publicDir = path.join(process.cwd(), 'public');
        const invitesDir = path.join(publicDir, 'invites');

        // Check if directories exist
        const publicExists = fs.existsSync(publicDir);
        const invitesExists = fs.existsSync(invitesDir);

        // Get list of files in invites directory if it exists
        let inviteFiles: string[] = [];
        if (invitesExists) {
            inviteFiles = fs.readdirSync(invitesDir);
        }

        // Check built-in static files
        const vercelSvgExists = fs.existsSync(path.join(publicDir, 'vercel.svg'));
        const nextSvgExists = fs.existsSync(path.join(publicDir, 'next.svg'));

        // Try to read one of the invite files if available
        let sampleFileInfo = null;
        if (inviteFiles.length > 0) {
            const sampleFilePath = path.join(invitesDir, inviteFiles[0]);
            const stats = fs.statSync(sampleFilePath);
            sampleFileInfo = {
                name: inviteFiles[0],
                size: stats.size,
                created: stats.birthtime,
                accessPermissions: {
                    read: false,
                    write: false
                }
            };

            try {
                fs.accessSync(sampleFilePath, fs.constants.R_OK);
                sampleFileInfo.accessPermissions.read = true;
            } catch (e) {
                // Cannot read
            }

            try {
                fs.accessSync(sampleFilePath, fs.constants.W_OK);
                sampleFileInfo.accessPermissions.write = true;
            } catch (e) {
                // Cannot write
            }
        }

        // Get process environment info
        const envInfo = {
            nodeEnv: process.env.NODE_ENV,
            cwd: process.cwd(),
            platform: process.platform,
            uid: process.getuid?.() || 'N/A',
            gid: process.getgid?.() || 'N/A'
        };

        return NextResponse.json({
            directories: {
                publicExists,
                publicPath: publicDir,
                invitesExists,
                invitesPath: invitesDir
            },
            staticFiles: {
                vercelSvgExists,
                nextSvgExists
            },
            inviteFiles: {
                count: inviteFiles.length,
                files: inviteFiles.map(f => `/invites/${f}`),
                sampleFile: sampleFileInfo
            },
            environment: envInfo
        });
    } catch (error) {
        console.error('Error in file system debug API:', error);
        return NextResponse.json({
            error: 'An error occurred',
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
