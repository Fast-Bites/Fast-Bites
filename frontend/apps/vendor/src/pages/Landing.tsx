import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Fast Bites</p>
        <h1 className="mt-2 text-3xl font-semibold">Vendor Portal</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70">
          Restaurant dashboard for orders, menu updates, and operating hours.
        </p>
      </div>

      <Link
        to="/sign-in"
        className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Sign in to your restaurant
      </Link>
    </div>
  );
}
