import { BLOCK_TYPES, blankBlock } from '../types';
import type { ArticleBlock, BlockType } from '../types';
import { Button, TextArea, TextInput } from './ui';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

const TYPE_LABELS: Record<BlockType, string> = {
  paragraph: 'Paragraphe',
  heading: 'Titre',
  list: 'Liste',
  quote: 'Citation',
  table: 'Tableau',
  code: 'Code',
  image: 'Image',
  cta: 'Appel à action',
};

function set<T extends Record<string, unknown>>(block: ArticleBlock, field: string, value: unknown): ArticleBlock {
  return { ...block, [field]: value } as ArticleBlock;
}

function BodyEditor({
  block,
  onChange,
}: {
  block: ArticleBlock;
  onChange: (b: ArticleBlock) => void;
}) {
  switch (block.type) {
    case 'paragraph':
      return (
        <TextArea
          rows={3}
          value={block.text}
          onChange={(e) => onChange(set(block, 'text', e.target.value))}
          placeholder="Contenu du paragraphe"
        />
      );

    case 'heading':
      return (
        <div className="grid grid-cols-[140px_1fr] gap-3">
          <select
            className="rounded-lg border border-default bg-surface px-3 py-2 text-sm"
            value={block.level}
            onChange={(e) => onChange(set(block, 'level', Number(e.target.value)))}
          >
            <option value={2}>Titre H2</option>
            <option value={3}>Titre H3</option>
          </select>
          <TextInput
            value={block.text}
            onChange={(e) => onChange(set(block, 'text', e.target.value))}
            placeholder="Texte du titre"
          />
        </div>
      );

    case 'list':
      return (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[--color-gold]"
              checked={block.ordered ?? false}
              onChange={(e) => onChange(set(block, 'ordered', e.target.checked))}
            />
            Liste numérotée
          </label>
          <TextArea
            rows={Math.max(3, block.items.length)}
            value={block.items.join('\n')}
            onChange={(e) => onChange(set(block, 'items', e.target.value.split('\n')))}
            placeholder={'Un élément par ligne'}
          />
        </div>
      );

    case 'quote':
      return (
        <div className="space-y-3">
          <TextArea
            rows={2}
            value={block.text}
            onChange={(e) => onChange(set(block, 'text', e.target.value))}
            placeholder="Citation"
          />
          <TextInput
            value={block.author ?? ''}
            onChange={(e) => onChange(set(block, 'author', e.target.value))}
            placeholder="Auteur (optionnel)"
          />
        </div>
      );

    case 'table':
      return (
        <TableEditor
          headers={block.headers}
          rows={block.rows}
          caption={block.caption ?? ''}
          onChange={(headers, rows, caption) =>
            onChange({ ...block, headers, rows, caption } as ArticleBlock)
          }
        />
      );

    case 'code':
      return (
        <div className="space-y-3">
          <TextInput
            value={block.language ?? ''}
            onChange={(e) => onChange(set(block, 'language', e.target.value))}
            placeholder="Langage (ex. ts)"
          />
          <TextArea
            rows={5}
            className="font-mono"
            value={block.code}
            onChange={(e) => onChange(set(block, 'code', e.target.value))}
            placeholder="Code…"
          />
        </div>
      );

    case 'image':
      return (
        <div className="space-y-3">
          <TextInput
            value={block.src}
            onChange={(e) => onChange(set(block, 'src', e.target.value))}
            placeholder="URL de l'image"
          />
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              value={block.alt}
              onChange={(e) => onChange(set(block, 'alt', e.target.value))}
              placeholder="Alt"
            />
            <TextInput
              value={block.caption ?? ''}
              onChange={(e) => onChange(set(block, 'caption', e.target.value))}
              placeholder="Légende (optionnel)"
            />
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className="space-y-3">
          <TextInput
            value={block.text}
            onChange={(e) => onChange(set(block, 'text', e.target.value))}
            placeholder="Question / texte de l'appel"
          />
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              value={block.href}
              onChange={(e) => onChange(set(block, 'href', e.target.value))}
              placeholder="Lien (ex. /careers)"
            />
            <TextInput
              value={block.label}
              onChange={(e) => onChange(set(block, 'label', e.target.value))}
              placeholder="Libellé du bouton"
            />
          </div>
        </div>
      );
  }
}

function TableEditor({
  headers,
  rows,
  caption,
  onChange,
}: {
  headers: string[];
  rows: string[][];
  caption: string;
  onChange: (headers: string[], rows: string[][], caption: string) => void;
}) {
  const cols = Math.max(1, headers.length);
  const addRow = () => onChange(headers, [...rows, Array(cols).fill('')], caption);
  const addCol = () =>
    onChange([...headers, ''], rows.map((r) => [...r, '']), caption);
  const removeCol = (i: number) => {
    if (headers.length <= 1) return;
    onChange(
      headers.filter((_, idx) => idx !== i),
      rows.map((r) => r.filter((_, idx) => idx !== i)),
      caption
    );
  };
  const setHeader = (i: number, v: string) =>
    onChange(headers.map((h, idx) => (idx === i ? v : h)), rows, caption);
  const setCell = (r: number, c: number, v: string) =>
    onChange(
      headers,
      rows.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? v : cell)) : row)),
      caption
    );

  return (
    <div className="space-y-3">
      <TextInput
        value={caption}
        onChange={(e) => onChange(headers, rows, e.target.value)}
        placeholder="Légende du tableau (optionnel)"
      />
      <div className="overflow-x-auto rounded-lg border border-default">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-2 py-2">
                  <div className="flex items-center gap-1">
                    <input
                      value={h}
                      onChange={(e) => setHeader(i, e.target.value)}
                      placeholder={`Colonne ${i + 1}`}
                      className="bg-transparent font-medium outline-none placeholder:text-muted"
                    />
                    <button
                      onClick={() => removeCol(i)}
                      className="text-muted hover:text-red-400"
                      title="Supprimer la colonne"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="border-t border-default/50">
                {row.map((cell, c) => (
                  <td key={c} className="px-2 py-1">
                    <input
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      className="w-full bg-transparent outline-none placeholder:text-muted"
                      placeholder="…"
                    />
                  </td>
                ))}
                <td className="px-1">
                  <button
                    onClick={() =>
                      onChange(headers, rows.filter((_, ri) => ri !== r), caption)
                    }
                    className="text-muted hover:text-red-400"
                    title="Supprimer la ligne"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="ghost" onClick={addRow}>
        + Ligne
      </Button>
      <Button variant="ghost" onClick={addCol}>
        + Colonne
      </Button>
    </div>
  );
}

export default function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
}) {
  const update = (i: number, b: ArticleBlock) =>
    onChange(blocks.map((x, idx) => (idx === i ? b : x)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const remove = (i: number) => onChange(blocks.filter((_, idx) => idx !== i));

  const addAfter = (i: number, type: BlockType) => {
    const next = [...blocks];
    next.splice(i + 1, 0, blankBlock(type));
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        Corps de l&apos;article ({blocks.length} blocs)
      </p>

      {blocks.length === 0 && (
        <p className="rounded-lg border border-dashed border-default p-6 text-center text-muted">
          Aucun bloc — ajoutez-en ci-dessous.
        </p>
      )}

      {blocks.map((block, i) => (
        <div key={i} className="rounded-xl border border-default bg-surface/40">
          <div className="flex flex-wrap items-center gap-2 rounded-t-xl border-b border-default bg-background/60 px-3 py-2">
            <span className="inline-flex w-28 rounded bg-border-strong px-2 py-0.5 text-center text-xs font-medium text-glow">
              {TYPE_LABELS[block.type]}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded p-1 text-secondary hover:text-primary disabled:opacity-30"
                title="Monter"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === blocks.length - 1}
                className="rounded p-1 text-secondary hover:text-primary disabled:opacity-30"
                title="Descendre"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <select
              value={block.type}
              onChange={(e) => update(i, blankBlock(e.target.value as BlockType))}
              className="ml-auto rounded border border-default bg-surface px-2 py-1 text-xs"
            >
              {BLOCK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <button
              onClick={() => remove(i)}
              className="rounded p-1 text-secondary hover:text-red-400"
              title="Supprimer le bloc"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <BodyEditor block={block} onChange={(b) => update(i, b)} />
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-default p-4">
        <Plus className="h-4 w-4 text-gold-dark" />
        <span className="mr-1 text-sm text-secondary">Ajouter un bloc :</span>
        {BLOCK_TYPES.map((t) => (
          <Button key={t} variant="ghost" onClick={() => addAfter(blocks.length - 1, t)}>
            {TYPE_LABELS[t]}
          </Button>
        ))}
      </div>
    </div>
  );
}