# TDG Connect

TDG Connect is a social networking web application built with Next.js, designed to help users connect, share, and engage in meaningful conversations. The platform allows users to register, log in, and create connections with others using unique codes. Once connected, users can view their network, share contact information, and receive AI-generated conversation starters tailored to their interests and shared topics.

## Key Features

- **User Authentication:** Secure registration and login using email and password.
- **Unique User Codes:** Each user receives a unique code to facilitate easy and private connections.
- **Connections Management:** Users can add, view, and disconnect from connections. Only active connections are shown in the main interface.
- **AI-Powered Conversation Starters:** The app integrates with OpenAI to generate personalized conversation starters based on user interests and shared topics.
- **Contact Sharing:** Users can share their email with connections securely.
- **Dashboard:** Users can view their total connections, network rank, and access conversation tools.
- **Admin Dashboard:** Admins can view all users, their connections, and platform statistics.

## Typical User Flow

1. **Register** with your details and interests.
2. **Log in** to access your dashboard.
3. **Connect** with others by exchanging unique codes.
4. **View and manage** your connections.
5. **Start conversations** with AI-generated prompts.
6. **Share contact info** securely with trusted connections.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
