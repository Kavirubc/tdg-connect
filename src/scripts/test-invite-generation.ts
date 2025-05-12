import { connectToDatabase } from '../lib/mongodb';
import { generateUserInvite } from '../lib/email-utils';
import User from '../models/User';

async function testInviteGeneration() {
    try {
        console.log('Connecting to database...');
        await connectToDatabase();

        console.log('Finding a sample user...');
        const user = await User.findOne({}).sort({ createdAt: -1 }).limit(1);

        if (!user) {
            console.log('No users found in the database.');
            return;
        }

        console.log(`Found user: ${user.name} (${user.email})`);
        console.log(`Current inviteImageUrl: ${user.inviteImageUrl || 'none'}`);

        console.log('Generating invite image...');
        const inviteResult = await generateUserInvite(user.name, user.code);

        console.log('Invite generation result:', inviteResult);

        console.log('Updating user with new invite image URL...');
        user.inviteImageUrl = inviteResult.publicUrl;
        await user.save();

        console.log('Updated user successfully. New inviteImageUrl:', user.inviteImageUrl);

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error testing invite generation:', error);
        process.exit(1);
    }
}

testInviteGeneration();
