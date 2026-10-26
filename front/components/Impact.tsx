import { getTranslations } from 'next-intl/server';

type ImpactCase = {
  pole: string;
  title: string;
  approach: string;
  impact: string;
};

const images = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2000&auto=format&fit=crop',
];

export default async function Impact() {
  const t = await getTranslations('impact');
  const cases = (t.raw('cases') as ImpactCase[]).map((c, i) => ({ ...c, image: images[i % images.length] }));

  return (
    <section className="py-32 bg-neural-grid" aria-labelledby="impact-heading">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 id="impact-heading" className="text-3xl md:text-5xl font-heading font-bold mb-6">
            {t('heading')}
          </h2>
          <p className="text-secondary max-w-2xl mx-auto text-lg">{t('sub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.map((c) => (
            <article
              key={c.pole}
              className="group relative rounded-2xl overflow-hidden shadow-xl border border-default bg-surface aspect-[4/3] md:aspect-auto md:h-auto pb-8 md:pb-0 h-full flex flex-col"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-700 duotone-gold"
                style={{ backgroundImage: `url('${c.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
              <div className="relative z-10 p-8 flex flex-col h-full justify-end mt-32 md:mt-48">
                <a
                  href="#poles"
                  className="w-fit text-gold hover:text-gold-light font-mono text-sm mb-3 underline decoration-gold/30 underline-offset-4"
                >
                  {c.pole}
                </a>
                <h3 className="text-2xl font-heading font-bold mb-4">{c.title}</h3>
                <div className="space-y-4 flex-1">
                  <p className="text-muted text-sm">
                    <span className="text-primary font-semibold block mb-1">{t('approachLabel')}</span>
                    {c.approach}
                  </p>
                  <div className="bg-gold-dark/10 border-l-2 border-gold p-3 rounded-r-lg">
                    <p className="text-gold text-xs uppercase tracking-wider font-bold mb-1">
                      {t('impactLabel')}
                    </p>
                    <p className="text-muted text-xs">{c.impact}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}