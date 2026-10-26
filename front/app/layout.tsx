import type { ReactNode } from 'react';

/**
 * Layout racine minimal : le `<html>`, la langue et le body sont gérés dans
 * `app/[locale]/layout.tsx` (motif next-intl). Ce fichier n'existe que pour
 * satisfaire l'exigence Next.js d'un Root Layout.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}