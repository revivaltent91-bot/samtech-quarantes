import { Layers } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

type ConvergencePoint = {
  title: string;
  desc: string;
};

export default async function Convergence() {
  const t = await getTranslations('convergence');
  const points = t.raw('points') as ConvergencePoint[];

  return (
    <section
      id="expertise"
      className="py-32 bg-surface relative overflow-hidden border-y border-default"
      aria-labelledby="convergence-heading"
    >
      <div className="absolute right-0 top-0 w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 duotone-gold mask-image-linear-left" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1">
          <h2 id="convergence-heading" className="text-3xl md:text-5xl font-heading font-bold mb-6">
            {t('heading')} <span className="text-gradient-gold">{t('headingGold')}</span>
          </h2>
          <p className="text-gold font-medium mb-4 text-sm">{t('kicker')}</p>
          <p className="text-secondary text-lg mb-8 leading-relaxed">{t('p')}</p>

          <ul className="space-y-6">
            {points.map((item) => (
              <li key={item.title} className="flex gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-gold-dark/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-1">{item.title}</h3>
                  <p className="text-secondary text-sm">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[600px] rounded-2xl border border-dashed border-default bg-surface/30 overflow-hidden flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-full bg-border-strong/20 flex items-center justify-center mb-4 text-gold">
            <Layers className="w-8 h-8" />
          </div>
          <p className="text-secondary font-medium">{t('placeholderLabel')}</p>
          <p className="text-sm text-muted mt-2 max-w-xs">{t('placeholderDesc')}</p>
        </div>
      </div>
    </section>
  );
}