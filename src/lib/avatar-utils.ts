// Helper functions for working with avatar URLs across the application

/**
 * Formats an avatar URL to ensure it has the correct prefix and optional cache busting
 * @param url The avatar URL to format
 * @param cacheBust Whether to append a cache-busting timestamp
 * @returns Properly formatted avatar URL
 */
export function formatAvatarUrl(url: string | undefined, cacheBust: boolean = false): string {
    if (!url) return '';

    // Remove any existing query params for proper formatting
    const [baseUrl, existingQuery] = url.split('?');

    // Ensure the URL has the correct /userAvatar/ prefix
    const formattedUrl = baseUrl.startsWith('/userAvatar/')
        ? baseUrl
        : baseUrl.startsWith('/')
            ? `/userAvatar${baseUrl}`
            : `/userAvatar/${baseUrl}`;

    // Add cache busting if requested
    const cacheBustParam = cacheBust ? `t=${Date.now()}` : '';

    // Combine everything with proper query param formatting
    if (existingQuery && cacheBustParam) {
        return `${formattedUrl}?${existingQuery}&${cacheBustParam}`;
    } else if (existingQuery) {
        return `${formattedUrl}?${existingQuery}`;
    } else if (cacheBustParam) {
        return `${formattedUrl}?${cacheBustParam}`;
    }

    return formattedUrl;
}

/**
 * Gets API fallback URL for avatar images
 * @param url The original avatar URL
 * @returns API fallback URL for the avatar
 */
export function getAvatarApiFallbackUrl(url: string | undefined): string {
    if (!url) return '';
    // Remove query params
    const [baseUrl] = url.split('?');
    const filename = baseUrl.split('/').pop();
    return `/api/user/avatar/${filename}`;
}
