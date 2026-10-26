'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

/**
 * Bouton langue façon pill KARABA : conserve la route courante et bascule
 * entre FR (racine) et EN (/en/...) — cf. DESIGN-SYSTEM-THEME-I18N §5.5.
 */
export default function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations('localeSwitcher');
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale = locale === 'fr' ? 'en' : 'fr';
  const label = locale === 'fr' ? t('fr') : t('en');

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      className="shrink-0 px-4 py-1.5 rounded-full border border-default text-sm font-medium text-muted transition-colors hover:border-gold-dark hover:text-primary"
      aria-label={label}
    >
      {label}
    </button>
  );
}