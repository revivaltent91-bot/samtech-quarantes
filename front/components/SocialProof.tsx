import { Server, Database, Shield } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function SocialProof() {
  const t = await getTranslations('socialProof');
  const logos = t.raw('logos') as string[];

  return (
    <section
      className="py-16 border-y border-default bg-background relative overflow-hidden"
      aria-label={t('heading')}
    >
      <div className="absolute inset-0 bg-neural-grid opacity-30" />
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/3">
          <h3 className="text-xl font-heading font-bold mb-2 text-primary">{t('heading')}</h3>
          <p className="text-sm text-secondary">{t('p')}</p>
        </div>
        <div className="md:w-2/3 flex flex-wrap items-center gap-x-12 gap-y-8">
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-default/50 pb-1">
              {t('standardsTitle')}
            </p>
            <div className="flex flex-wrap items-center gap-6 opacity-60">
              <div className="flex items-center gap-1.5 text-sm font-heading font-bold">
                <Server className="w-4 h-4" /> Google Cloud
              </div>
              <div className="flex items-center gap-1.5 text-sm font-heading font-bold">
                <Database className="w-4 h-4" /> Vertex AI
              </div>
              <div className="flex items-center gap-1.5 text-sm font-heading font-bold">
                <Shield className="w-4 h-4" /> ISO 42001
              </div>
              <div className="flex items-center gap-1.5 text-sm font-heading font-bold">
                <Shield className="w-4 h-4" /> SOC-2
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto flex-1">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-default/50 pb-1">
              {t('trustTitle')}
            </p>
            <div className="flex flex-wrap items-center gap-6">
              {logos.map((logo) => (
                <div
                  key={logo}
                  className="h-8 px-4 rounded bg-surface border border-default flex items-center justify-center text-xs text-muted font-medium"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}