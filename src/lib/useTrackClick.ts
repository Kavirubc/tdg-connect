// Generic hook to track clicks on any element
import { useCallback } from 'react';
import { trackUiEvent } from './posthog';
import { usePathname } from 'next/navigation';

export function useTrackClick(eventName = 'ui_click', extraProps: Record<string, any> = {}) {
    const pathname = usePathname();
    return useCallback(
        (e?: React.MouseEvent<HTMLElement>) => {
            let element, label;
            if (e) {
                element = e.currentTarget.tagName.toLowerCase();
                label = (e.currentTarget as HTMLElement).getAttribute('aria-label') || (e.currentTarget as HTMLElement).textContent || undefined;
            }
            trackUiEvent({
                event: eventName,
                element,
                label,
                page: pathname,
                ...extraProps,
            });
        },
        [eventName, extraProps, pathname]
    );
}

export default useTrackClick;
