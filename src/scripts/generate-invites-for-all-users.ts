import { connectToDatabase } from '../lib/mongodb';
import { generateUserInvite } from '../lib/email-utils';
import User from '../models/User';

// Run this script to generate invitation images for all users who don't have one
async function generateInvitesForAllUsers() {
    try {
        console.log('Connecting to database...');
        await connectToDatabase();

        console.log('Finding users without invitation images...');
        const users = await User.find({ inviteImageUrl: { $exists: false } });

        console.log(`Found ${users.length} users without invitation images.`);

        for (const user of users) {
            try {
                console.log(`Generating invite for ${user.name} (${user.email})...`);
                const inviteResult = await generateUserInvite(user.name, user.code);

                console.log(`Updating user with new invite image URL: ${inviteResult.publicUrl}`);
                user.inviteImageUrl = inviteResult.publicUrl;
                await user.save();
                console.log(`Successfully updated user ${user.name}.`);
            } catch (error) {
                console.error(`Error generating invite for user ${user.name}:`, error);
            }
        }

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error in script:', error);
        process.exit(1);
    }
}

generateInvitesForAllUsers();
