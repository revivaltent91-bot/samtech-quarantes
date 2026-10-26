import { LogIn, Users, ArrowUpRight, Database } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const icons = [
  <LogIn className="w-5 h-5" />,
  <Users className="w-5 h-5" />,
  <ArrowUpRight className="w-5 h-5" />,
  <Database className="w-5 h-5" />,
];

const hrefs = ['#', '/careers', '#', '#'];

type AccessPath = {
  title: string;
  desc: string;
  status: string;
  available: boolean;
};

export default async function AccessPaths() {
  const t = await getTranslations('access');
  const paths = (t.raw('paths') as AccessPath[]).map((p, i) => ({ ...p, icon: icons[i % icons.length], href: hrefs[i % hrefs.length] }));

  return (
    <section className="py-24 bg-surface/30" aria-labelledby="access-heading">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 id="access-heading" className="text-3xl font-heading font-bold mb-4">
            {t('heading')}
          </h2>
          <p className="text-secondary">{t('sub')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paths.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`p-6 rounded-xl bg-background border border-default hover:border-gold-dark/50 transition-colors flex flex-col h-full group ${!item.available ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''}`}
              aria-disabled={!item.available}
              tabIndex={!item.available ? -1 : undefined}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded bg-surface flex items-center justify-center text-secondary group-hover:text-gold transition-colors">
                  {item.icon}
                </div>
                <span
                  className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded border ${item.available ? 'bg-gold-dark/10 text-gold border-gold/30' : 'bg-border-strong/20 text-muted border-default/30'}`}
                >
                  {item.status}
                </span>
              </div>
              <h3 className="font-bold text-primary mb-2">{item.title}</h3>
              <p className="text-xs text-muted leading-relaxed mt-auto">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}