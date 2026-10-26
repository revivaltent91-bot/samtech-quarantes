import { FormEvent, useState } from 'react';
import { Lock, User } from 'lucide-react';
import { api, ApiError } from '../api';
import { Button, ErrorBanner } from './ui';

export default function Login({ onAuthed }: { onAuthed: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.login(username, password);
      onAuthed();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : 'Erreur de connexion');
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            QUARANTES<span className="text-gold">.</span>
          </h1>
          <p className="mt-2 text-sm text-muted">Console d&apos;édition</p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-default bg-background p-8 shadow-sm"
        >
          <div className="space-y-4">
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                placeholder="Identifiant"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                autoFocus
                className="w-full rounded-lg border border-default bg-surface py-2.5 pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:border-gold-dark outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-default bg-surface py-2.5 pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:border-gold-dark outline-none"
              />
            </div>

            {error && <ErrorBanner>{error}</ErrorBanner>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Connexion…' : 'Se connecter'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Espace réservé aux équipes éditoriales QUARANTES.
        </p>
      </div>
    </div>
  );
}