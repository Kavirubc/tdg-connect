# Daily Grind Season 3 - Invitation System

This document explains how the invitation image system works in the Daily Grind Connect application.

## Overview

When a user registers for the Daily Grind Season 3 event, the system:

1. Creates a personalized "I'll be there" image for the user
2. Sends this image via email to the user
3. Stores the image URL in the user's profile for later access

Users can access their invitation image from their profile page, download it, and regenerate it if needed.

## Technical Implementation

### Image Generation

- Images are generated using the Canvas API
- Each image includes the user's name and current date
- Images are saved in the `/public/invites` directory with a timestamp-based filename
- 1:1 aspect ratio optimized for social media sharing

### Email Delivery

- Uses Nodemailer to send emails via SMTP
- The invitation image is attached to the email
- The email includes instructions for sharing the image on social media

### Storage

- The public URL to the image is stored in the user's profile in the database
- Images can be regenerated on demand from the profile page

## Configuration

To set up the email service, you need to add the following variables to your `.env.local` file:

```
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password
```

For Gmail users, you'll need to create an App Password in your Google Account settings.

## Usage

### For Users

1. After registration, check your email for the invitation image
2. You can also view and download the image from your profile page
3. Use the "Regenerate Image" button if you want a new version of the image

### For Developers

- The image generation code is in `src/lib/email-utils.ts`
- Email configuration is handled in the same file
- The API routes for registration and image regeneration are in:
  - `src/app/api/register/route.ts`
  - `src/app/api/user/regenerate-invite/route.ts`
