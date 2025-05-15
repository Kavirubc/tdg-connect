'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

// Initialize PostHog only on the client side and only once
if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'your-project-api-key', {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        // Enable debug mode in development
        loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') posthog.debug();
        },
        capture_pageview: true, // Enable automatic $pageview events
        capture_pageleave: true // Enable automatic $pageleave events
    });
}

// Analytics event types we want to track
export const EVENTS = {
    LOGIN: 'user_login',
    REGISTRATION: 'user_registration',
    DISCOVER_VIEW: 'discover_page_view',
    SEE_YOU_SOON: 'see_you_soon_action',
    CONNECTION_CREATED: 'connection_created',
    AVATAR_GENERATED: 'avatar_generated',
    PAGE_VIEW: 'page_view'
};

// Helper functions to track specific events
export const trackLogin = (userId: string, email: string) => {
    posthog.identify(userId, { email });
    posthog.capture(EVENTS.LOGIN, { userId, email });
};

export const trackRegistration = (userId: string, email: string) => {
    posthog.identify(userId, { email });
    posthog.capture(EVENTS.REGISTRATION, { userId, email });
};

export const trackDiscoverView = () => {
    posthog.capture(EVENTS.DISCOVER_VIEW);
};

export const trackSeeYouSoon = (userId: string) => {
    posthog.capture(EVENTS.SEE_YOU_SOON, { userId });
};

export const trackConnectionCreated = (userId: string, connectionId: string) => {
    posthog.capture(EVENTS.CONNECTION_CREATED, { userId, connectionId });
};

export const trackAvatarGenerated = (userId: string) => {
    posthog.capture(EVENTS.AVATAR_GENERATED, { userId });
};

export const trackPageView = (url: string, props = {}) => {
    posthog.capture(EVENTS.PAGE_VIEW, { url, ...props });
};

// Generic UI event tracking
type UiEventProps = {
    event: string;
    element?: string;
    label?: string;
    page?: string;
    userId?: string;
    [key: string]: any;
};

export const trackUiEvent = (props: UiEventProps) => {
    posthog.capture(props.event, props);
};

export { posthog, PostHogProvider };
