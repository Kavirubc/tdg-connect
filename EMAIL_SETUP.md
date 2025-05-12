# Email Setup Guide for Daily Grind Connect

This guide will help you set up the email feature for sending the "Daily Grind Season 3 - I'll be there" images to users after registration.

## Gmail App Passwords

For security reasons, Gmail requires you to use an "App Password" instead of your regular password when using SMTP. Here's how to get one:

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", find "2-Step Verification" and make sure it's enabled
4. Go back to the Security page and click on "App passwords" (you might need to sign in again)
5. Select "Mail" for the app and "Other" for the device (you can name it "Daily Grind Connect")
6. Click "Generate"
7. Google will provide you with a 16-character app password (spaces will be removed when you use it)

## Setting Up Environment Variables

Add these variables to your `.env.local` file:

```
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_16_character_app_password
```

For example:

```
EMAIL_USER=dailygrind@gmail.com
EMAIL_APP_PASSWORD=abcdefghijklmnop
```

## Testing the Email Feature

To test if your email configuration is working:

1. Register a new user with a valid email address
2. Check the email inbox for the registration confirmation with the attached image
3. Make sure the image is properly embedded in the email and also attached for download

## Troubleshooting

If emails aren't being sent:

1. Check the server logs for any error messages
2. Verify that your app password is correct
3. Make sure you've enabled "Less secure app access" in your Google account if using a regular Gmail account
4. Consider using a Gmail account dedicated to your application
5. Make sure your server can make outbound connections on port 465 (for secure SMTP)

## Using Other Email Providers

The current implementation uses Gmail's SMTP server. If you want to use a different provider:

1. Update the `createTransporter` function in `src/lib/email-utils.ts` with your provider's SMTP settings
2. Update the environment variables accordingly

For more help, refer to the Nodemailer documentation: https://nodemailer.com/
