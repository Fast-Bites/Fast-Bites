import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LogOut, Search } from 'lucide-react';
import { vendorApi, vendorAuth } from '@/lib/api';
import { redirectToCustomerVendorSignIn } from '@/lib/customerAuthRedirect';

const logoSrc = `${import.meta.env.BASE_URL}logo/Fast bite transparent I.png`;
const asset = (file: string) => `${import.meta.env.BASE_URL}assets/nav/${file}`;

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard.png', invert: false, end: true },
  { to: '/orders', label: 'Orders', icon: 'orders.png', invert: false, end: false },
  { to: '/menu', label: 'Menu', icon: 'menu.png', invert: true, end: false },
  { to: '/analytics', label: 'Analytics', icon: 'analytics.png', invert: true, end: false },
  { to: '/review', label: 'Review', icon: 'review.png', invert: false, end: false },
  { to: '/inbox', label: 'Inbox', icon: 'inbox.png', invert: true, end: false },
] as const;

function HamburgerIcon({ className = '' }: { className?: string }) {
  return (
    <span className={`flex w-5 flex-col gap-[5px] ${className}`} aria-hidden>
      <span className="h-[2px] w-full rounded-full bg-current" />
      <span className="h-[2px] w-full rounded-full bg-current" />
      <span className="h-[2px] w-full rounded-full bg-current" />
    </span>
  );
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex size-12 items-center justify-center rounded-full transition',
    isActive ? 'bg-[#272727]' : 'hover:bg-white/10',
  ].join(' ');

export default function VendorLayout() {
  const [displayName, setDisplayName] = useState('Vendor');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void vendorApi.getBusinessRegistration().then((result) => {
      if (cancelled || !result.data) return;
      const owner = result.data.business_owner?.trim();
      const business = result.data.business_name?.trim();
      setDisplayName(owner || business || 'Vendor');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const handleSignOut = async () => {
    await vendorAuth.signOut();
    redirectToCustomerVendorSignIn();
  };

  return (
    <div className="flex min-h-screen bg-[#f3f9ff] text-[#111111]">
      <aside
        className={[
          'sticky top-0 flex h-screen w-[72px] shrink-0 flex-col items-center py-3 sm:w-[88px]',
          sidebarOpen ? 'bg-[#111111]' : 'bg-transparent',
        ].join(' ')}
      >
        {sidebarOpen ? (
          <img
            src={logoSrc}
            alt="Fast Bites"
            className="mb-6 size-16 object-contain sm:size-[4.5rem]"
          />
        ) : (
          /* Match logo footprint so the hamburger stays put */
          <div className="mb-6 size-16 sm:size-[4.5rem]" aria-hidden />
        )}

        <button
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          title={sidebarOpen ? 'Hide menu' : 'Show menu'}
          aria-label={sidebarOpen ? 'Hide menu' : 'Show menu'}
          className={[
            'flex size-12 items-center justify-center rounded-full text-white transition',
            sidebarOpen
              ? 'bg-white/15 hover:bg-white/20'
              : 'bg-[#111111] shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:bg-[#222222]',
          ].join(' ')}
        >
          <HamburgerIcon />
        </button>

        {sidebarOpen ? (
          <>
            {/* Larger gap after hamburger; equal tighter gaps between nav icons */}
            <nav className="mt-10 flex flex-1 flex-col items-center gap-5">
              {navItems.map(({ to, label, icon, invert, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={label}
                  aria-label={label}
                  className={navClass}
                >
                  <img
                    src={asset(icon)}
                    alt=""
                    className={[
                      'size-5 object-contain',
                      invert ? 'brightness-0 invert' : '',
                    ].join(' ')}
                  />
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
              className="mb-2 flex size-12 items-center justify-center rounded-full text-primary transition hover:bg-primary/15"
            >
              <LogOut size={20} />
            </button>
          </>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-black/20 bg-[#f3f9ff]/95 px-4 py-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <h1 className="min-w-0 flex-1 truncate text-lg font-bold sm:text-[22px]">
              Welcome, {displayName}
            </h1>
            <label className="relative hidden min-[420px]:block">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#c0c0c0]"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="h-11 w-[150px] rounded-full bg-white pl-10 pr-4 text-base text-[#111111] outline-none placeholder:text-[#c0c0c0] sm:w-[191px]"
              />
            </label>
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-white bg-black text-sm font-semibold text-white"
              aria-hidden
            >
              {initials || 'V'}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6">
          <Outlet context={{ search }} />
        </main>
      </div>
    </div>
  );
}
