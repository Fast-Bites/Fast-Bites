import { NavLink, Outlet } from 'react-router-dom';
import { ChefHat, Clock3, LayoutDashboard, LogOut, UtensilsCrossed } from 'lucide-react';
import { vendorAuth } from '@/lib/api';
import { redirectToCustomerRestaurantSignIn } from '@/lib/customerAuthRedirect';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/orders', label: 'Orders', icon: UtensilsCrossed, end: false },
  { to: '/menu', label: 'Menu', icon: ChefHat, end: false },
  { to: '/hours', label: 'Hours', icon: Clock3, end: false },
] as const;

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition',
    isActive
      ? 'border-primary bg-primary/10 text-primary'
      : 'border-transparent text-foreground/80 hover:border-foreground/10 hover:bg-surface hover:text-foreground',
  ].join(' ');

export default function VendorLayout() {
  const handleSignOut = async () => {
    await vendorAuth.signOut();
    redirectToCustomerRestaurantSignIn();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-foreground/10 bg-surface px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Fast Bites</p>
            <h1 className="text-lg font-semibold">Vendor Portal</h1>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-foreground/15 px-3 py-2 text-sm transition hover:border-primary hover:text-primary"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row md:px-8">
        <nav className="flex shrink-0 gap-2 overflow-x-auto md:w-56 md:flex-col">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
