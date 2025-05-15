'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/posthog';

/**
 * A utility hook that tracks page views based on route changes
 * Import and use this in any client component where you want to track page views
 */
export function usePageViewTracking() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname) {
            let url = window.origin + pathname;
            if (searchParams?.toString()) {
                url = `${url}?${searchParams.toString()}`;
            }

            // Track the page view
            trackPageView(url);
        }
    }, [pathname, searchParams]);

    return null;
}

export default usePageViewTracking;
