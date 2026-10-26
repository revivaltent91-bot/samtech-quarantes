import type { ArticleBlock } from '@/lib/articles';
import { slugify } from '@/lib/articles';

export default function ArticleContent({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="space-y-8">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading':
            return block.level === 2 ? (
              <h2
                key={idx}
                id={slugify(block.text)}
                className="text-2xl md:text-3xl font-heading font-bold mt-4 scroll-mt-24"
              >
                {block.text}
              </h2>
            ) : (
              <h3 key={idx} className="text-xl font-heading font-bold mt-2">
                {block.text}
              </h3>
            );

          case 'paragraph':
            return (
              <p key={idx} className="text-secondary leading-relaxed">
                {block.text}
              </p>
            );

          case 'list':
            return block.ordered ? (
              <ol key={idx} className="list-decimal list-inside space-y-3 text-secondary leading-relaxed">
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul key={idx} className="space-y-3 text-secondary leading-relaxed">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gold-dark shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );

          case 'quote':
            return (
              <blockquote
                key={idx}
                className="border-l-2 border-gold bg-gold-dark/10 rounded-r p-6"
              >
                <p className="text-lg text-primary leading-relaxed italic">&ldquo;{block.text}&rdquo;</p>
                {block.author && (
                  <footer className="mt-3 text-sm text-gold font-medium">
                    — {block.author}
                  </footer>
                )}
              </blockquote>
            );

          case 'table':
            return (
              <figure key={idx}>
                {block.caption && (
                  <figcaption className="text-sm text-muted mb-3">{block.caption}</figcaption>
                )}
                <div className="overflow-x-auto rounded-xl border border-default">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-surface">
                        {block.headers.map((header, i) => (
                          <th key={i} className="px-4 py-3 font-semibold text-gold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-t border-default/60">
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className={`px-4 py-3 text-muted ${cellIdx === 0 ? 'font-medium text-primary' : ''}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </figure>
            );

          case 'code':
            return (
              <pre
                key={idx}
                className="rounded-xl bg-background border border-default p-6 overflow-x-auto text-sm text-glow font-mono leading-relaxed"
              >
                <code>{block.code}</code>
              </pre>
            );

          case 'image':
            return (
              <figure key={idx}>
                <img
                  src={block.src}
                  alt={block.alt}
                  loading="lazy"
                  className="w-full rounded-xl border border-default object-cover"
                />
                {block.caption && (
                  <figcaption className="text-sm text-muted mt-3 text-center">{block.caption}</figcaption>
                )}
              </figure>
            );

          case 'cta':
            return (
              <div key={idx} className="p-8 rounded-2xl cyber-border bg-background border-pulse/30">
                <div className="absolute top-0 right-0 w-48 h-48 bg-pulse/10 rounded-full blur-[80px]" />
                <p className="text-lg font-heading font-bold text-primary mb-4">{block.text}</p>
                <a
                  href={block.href}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded bg-gold text-black font-semibold hover:bg-gold-light transition-colors"
                >
                  {block.label}
                </a>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}