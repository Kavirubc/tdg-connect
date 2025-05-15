# PostHog Analytics Implementation Guide

This document describes the PostHog implementation for tracking user events in the TDG Connect application.

## Configuration

PostHog is configured in `.env.local` with the following settings:

```
NEXT_PUBLIC_POSTHOG_KEY=phc_YourPostHogProjectApiKeyHere
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

To get your own PostHog API key:

1. Create an account at [PostHog](https://app.posthog.com)
2. Create a new project
3. Copy the API key from your project settings and add it to the `.env.local` file

## Events Tracked

The following events are tracked:

1. **User Authentication**

   - Login events (`user_login`)
   - Registration events (`user_registration`)

2. **Feature Usage**

   - Discover page views (`discover_page_view`)
   - See You Soon user actions (`see_you_soon_action`)
   - Connection creation events (`connection_created`)
   - Avatar generation events (`avatar_generated`)

3. **General Usage**
   - Page views for all pages (`page_view`)

## Implementation Details

The PostHog implementation consists of:

1. **PostHog Client**: Initialized in `/src/lib/posthog.ts`
2. **PostHog Provider**: Provides analytics context in `/src/components/PostHogAnalyticsProvider.tsx`
3. **Tracking Functions**: Helper functions for specific event tracking
4. **Page View Tracking Hook**: Utility hook in `/src/lib/tracking-hooks.ts`

## Extending Analytics

To track new events:

1. Add a new event constant in `/src/lib/posthog.ts`
2. Create a tracking function in `/src/lib/posthog.ts`
3. Import and use the tracking function in relevant components

Example:

```typescript
// In posthog.ts
export const EVENTS = {
  // Add your new event
  NEW_EVENT: "new_event",
};

export const trackNewEvent = (userId: string) => {
  posthog.capture(EVENTS.NEW_EVENT, { userId });
};

// In your component
import { trackNewEvent } from "@/lib/posthog";

// When the event happens
trackNewEvent(user.id);
```

## Accessing Analytics

To view analytics data:

1. Log in to [PostHog](https://app.posthog.com)
2. Navigate to your project
3. Use the "Insights" section to create visualizations and reports
4. Create dashboards to monitor key metrics

## Best Practices

- Don't track personally identifiable information (PII) unless necessary
- Group related events for better analysis
- Create funnels to understand user journey
- Set up cohorts based on user behavior
- Regularly review analytics to inform product decisions
