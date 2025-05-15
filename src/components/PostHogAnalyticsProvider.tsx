'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { posthog, PostHogProvider, trackPageView } from '@/lib/posthog';

// This component provides PostHog context and tracks page views
export function PostHogAnalyticsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Track page views
    useEffect(() => {
        if (pathname) {
            let url = window.origin + pathname;
            if (searchParams?.toString()) {
                url = `${url}?${searchParams.toString()}`;
            }
            trackPageView(url);
        }
    }, [pathname, searchParams]);

    // Make sure to only render children on the client to prevent posthog hydration issues
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export default PostHogAnalyticsProvider;
