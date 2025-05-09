import 'next-auth';

// Extend the built-in session types
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            code: string;
        }
    }

    interface User {
        id: string;
        name: string;
        email: string;
        code: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        code: string;
    }
}