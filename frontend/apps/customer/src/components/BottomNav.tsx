import { useNavigate, useLocation } from 'react-router-dom';
import { responsivePx } from '../constants/responsive';

export const BOTTOM_NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/home', icon: '/assets/Home-home.png' },
  { id: 'discover', label: 'Discover', path: '/discover', icon: '/assets/Discover-home.png' },
  { id: 'support', label: 'Support', path: '/support', icon: '/assets/Chat-home.png' },
  { id: 'wallet', label: 'Wallet', path: '/wallet', icon: '/assets/Wallet-home.png' },
] as const;

function activeTabFromPath(pathname: string): string {
  if (pathname === '/discover' || pathname.startsWith('/discover/')) return 'discover';
  if (pathname === '/support' || pathname.startsWith('/support/')) return 'support';
  if (pathname === '/wallet' || pathname.startsWith('/wallet/')) return 'wallet';
  if (pathname === '/home' || pathname.startsWith('/home/')) return 'home';
  return '';
}

/** Same bar as Home — fixed bottom, theme `bg-background` + primary pill. */
const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeTab = activeTabFromPath(pathname);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-muted/20 bg-background ${responsivePx} py-2`}
    >
      <div className="flex items-center justify-around min-[400px]:justify-center min-[400px]:gap-2 min-[574px]:gap-3">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(item.path)}
            className={`flex h-14 w-18 flex-col items-center justify-center gap-1 rounded-full p-2 transition-all min-[400px]:flex-1 ${
              activeTab === item.id ? 'bg-primary' : 'bg-transparent'
            }`}
          >
            <img src={item.icon} alt="" className="h-[18px] w-[18px]" />
            <span
              className={`text-[10px] ${
                activeTab === item.id
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
