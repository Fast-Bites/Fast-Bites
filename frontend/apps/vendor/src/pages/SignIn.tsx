import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { vendorAuth } from '@/lib/api';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await vendorAuth.signIn(email.trim(), password);
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const { data, error: profileError } = await vendorAuth.getProfile();
    if (profileError || !data) {
      setError(profileError || 'Could not load your profile.');
      await vendorAuth.signOut();
      return;
    }

    if (data.role !== 'restaurant') {
      setError('This portal is for restaurant accounts only.');
      await vendorAuth.signOut();
      return;
    }

    setSignedIn(true);
  };

  if (signedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-foreground/10 bg-surface p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Fast Bites</p>
          <h1 className="mt-2 text-2xl font-semibold">Vendor sign in</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Manage orders, menu, and opening hours for your restaurant.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-foreground/80">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              placeholder="you@restaurant.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-foreground/80">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              placeholder="Enter your password"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Need the customer app?{' '}
          <a href="/" className="text-primary hover:underline">
            Go to Fast Bites
          </a>
        </p>
      </div>
    </div>
  );
}
