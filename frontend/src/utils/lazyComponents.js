import { lazy } from 'react';

/**
 * Lazy load heavy components to reduce initial bundle size
 * These components will be loaded on-demand when needed
 */

// Chart component (recharts library is heavy ~100KB)
export const TabChart = lazy(() => import('../components/TabChart'));

// News sidebar (markdown rendering)
export const NewsSidebar = lazy(() => import('../components/NewsSidebar'));

// Modal components (not needed on initial load)
export const Glossary = lazy(() => import('../components/Glossary'));
export const IndustryGuide = lazy(() => import('../components/IndustryGuide'));

// Top stocks component
export const TopStocks = lazy(() => import('../components/TopStocks'));
