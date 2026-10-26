import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Next.js 16 a renommé `middleware.ts` en `proxy.ts` (export `proxy` ou
 * export par défaut). next-intl réécrit `/` → `/fr` sans redirect visible
 * (URL racine conservée) et sert `/en/...` en locale `en`
 * (cf. DESIGN-SYSTEM-THEME-I18N §5.1).
 */
export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/((?!api|console|docs|redoc|openapi.json|_next|_vercel|.*\\..*).*)'],
};