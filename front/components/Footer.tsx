'use client';

import { Linkedin, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="relative pt-24 pb-12 bg-tech-abyss border-t-gold-gradient overflow-hidden">
      <div className="bg-neural-void" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
          <div className="max-w-md">
            <div className="text-3xl font-heading font-bold tracking-tighter mb-2 text-primary">
              QUARANTES<span className="text-gold">.</span>
            </div>
            <p className="text-primary/70 text-sm mb-6 max-w-sm">{t('tagline')}</p>
            <p className="text-2xl md:text-4xl font-heading font-bold mb-8 text-primary">
              {t('headline')}
            </p>
            <button className="px-8 py-4 bg-gold text-black font-semibold rounded hover:bg-gold-light transition-colors flex items-center gap-2">
              {t('contactUs')}
            </button>
          </div>

          <nav aria-label={t('footerNavAriaLabel')} className="grid grid-cols-2 gap-12 text-sm">
            <div>
              <h3 className="font-bold text-primary mb-6 uppercase tracking-wider text-xs">
                {t('ecosystemTitle')}
              </h3>
              <ul className="space-y-4 text-primary/70">
                <li>
                  <a href="#poles" className="hover:text-gold transition-colors block">
                    {t('quarantesCabinet')}{' '}
                    <span className="text-[10px] opacity-60 ml-1">{t('quarantesCabinetLabel')}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://kofcorporation.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors block"
                  >
                    KOF CORPORATION
                  </a>
                </li>
                <li>
                  <a href="#poles" className="hover:text-gold transition-colors block">
                    KARABA OS
                  </a>
                </li>
                <li>
                  <a href="#poles" className="hover:text-gold transition-colors block">
                    TÉPÉ INTELLIGENCE
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-primary mb-6 uppercase tracking-wider text-xs">
                {t('holdingTitle')}
              </h3>
              <ul className="space-y-4 text-primary/70">
                <li>
                  <span className="opacity-70 block cursor-not-allowed">
                    {t('investorRelations')}{' '}
                    <span className="text-[10px] ml-1">({t('comingSoon')})</span>
                  </span>
                </li>
                <li>
                  <span className="opacity-70 block cursor-not-allowed">
                    {t('governanceISO')}{' '}
                    <span className="text-[10px] ml-1">({t('comingSoon')})</span>
                  </span>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-gold transition-colors block">
                    {t('careers')}
                  </Link>
                </li>
                <li>
                  <Link href="/projets" className="hover:text-gold transition-colors block">
                    {t('projects')}
                  </Link>
                </li>
                <li>
                  <Link href="/insights" className="hover:text-gold transition-colors block">
                    {t('insights')}
                  </Link>
                </li>
                <li>
                  <span className="opacity-70 block cursor-not-allowed">
                    {t('secureContact')}{' '}
                    <span className="text-[10px] ml-1">({t('inPreparation')})</span>
                  </span>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="pt-8 border-t border-gold/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary/60">
          <p>© {new Date().getFullYear()} QUARANTES Holding. {t('copyright')}</p>
          <nav aria-label={t('legalNavAriaLabel')} className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">
              {t('privacyPolicy')}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {t('legalNotices')}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {t('dataSecurity')}
            </a>
          </nav>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="https://www.linkedin.com/company/quarantes/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors"
              aria-label={t('linkedinAriaLabel')}
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gold hover:text-gold-light transition-colors"
              aria-label={t('whatsappAriaLabel')}
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}