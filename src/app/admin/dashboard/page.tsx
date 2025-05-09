// src/app/admin/dashboard/page.tsx
import { redirect } from 'next/navigation';
import AdminDashboardClient from './client'; // Assuming this is your actual client component

// Updated props definition for Next.js 15+ Server Components
interface AdminDashboardPageProps {
    // searchParams itself is a Promise that resolves to the search parameters object
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminDashboardPage({ searchParams: searchParamsPromise }: AdminDashboardPageProps) {
    // Await the searchParams promise to get the actual search parameters object
    const resolvedSearchParams = await searchParamsPromise;

    const adminPassword = process.env.ADMIN_PASS;

    if (!adminPassword) {
        console.error("CRITICAL: ADMIN_PASS environment variable is not set on the server.");
        // In async components, redirect throws an error that Next.js handles to stop rendering and send the redirect.
        redirect('/?error=admin_config_error');
        // Execution effectively stops here due to redirect throwing an error.
        // An explicit return null is not strictly necessary after redirect in async components
        // but can be added for clarity if preferred or if linters require it.
    }

    const passParam = resolvedSearchParams.pass; // Access 'pass' from the resolved object
    const providedPassword = typeof passParam === 'string' ? passParam : undefined;

    if (!providedPassword || providedPassword !== adminPassword) {
        console.warn("Admin dashboard access attempt failed: Incorrect or missing password.");
        redirect('/');
        // Execution effectively stops here.
    }

    // If the password is correct, render the AdminDashboardClient component.
    return <AdminDashboardClient />;
}
