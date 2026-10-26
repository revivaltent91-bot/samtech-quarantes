'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import LocaleSwitcher from '@/components/LocaleSwitcher';

export default function Navbar() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: '/#vision', label: t('vision') },
    { href: '/#poles', label: t('ecosystem') },
    { href: '/projets', label: t('projects') },
    { href: '/insights', label: t('insights') },
    { href: '/careers', label: t('careers') },
  ];

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-default"
      aria-label={t('mainNavAriaLabel')}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-heading font-bold tracking-tighter"
          aria-label={t('homeAriaLabel')}
          onClick={() => setOpen(false)}
        >
          QUARANTES<span className="text-gold-dark">.</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <button className="px-5 py-2.5 rounded bg-border-strong hover:bg-border-strong/80 border border-default transition-all hover:border-gold-dark text-primary">
            {t('investorRelations')}
          </button>
          <ThemeToggle />
          <LocaleSwitcher />
        </div>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <LocaleSwitcher />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t('closeMenu') : t('openMenu')}
            className="p-2.5 rounded border border-default text-primary hover:border-gold-dark transition-colors"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-default bg-background/95 backdrop-blur-md"
          >
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex flex-col divide-y divide-border-default">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="py-4 text-base font-medium text-secondary hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-6 w-full px-5 py-3 rounded bg-border-strong hover:bg-border-strong/80 border border-default transition-all hover:border-gold-dark text-primary text-sm font-medium"
              >
                {t('investorRelations')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}