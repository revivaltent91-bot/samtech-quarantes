'use client';

import { logEvent } from 'firebase/analytics';
import { getAnalyticsInstance } from '@/lib/firebase';

export const trackEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};
