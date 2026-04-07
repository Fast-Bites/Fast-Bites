import { useNavigate } from 'react-router-dom';
import { responsivePx } from '../constants/responsive';
import BottomNav from './BottomNav';

interface MenuOverlayProps {
  visible: boolean;
  onClose: () => void;
  /** Same source as Home header avatar */
  profileImageSrc: string;
  user?: { first_name?: string; last_name?: string; address?: string } | null;
}

const MENU_ITEMS = [
  { label: 'Location', icon: '/assets/menu map pin.svg', path: '/location' },
  { label: 'Notification', icon: '/assets/notification.svg', path: '/notifications' },
  { label: 'Cart', icon: '/assets/menu shopping-cart.svg', path: '/cart' },
  { label: 'Orders', icon: '/assets/menu shopping-bag.svg', path: '/orders' },
  { label: 'Privacy Policy', icon: '/assets/menu insurance(1) 1.svg', path: '/privacy-policy' },
  { label: 'Delete Account', icon: '/assets/menu delete.svg', path: '/delete-account' },
  { label: 'Logout', icon: '/assets/exit 1.svg', path: '/logout', isLogout: true },
];

const MenuOverlay: React.FC<MenuOverlayProps> = ({
  visible,
  onClose,
  user,
  profileImageSrc,
}) => {
  const navigate = useNavigate();

  if (!visible) return null;

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Guest'
    : 'Loading...';
  const displaySubtitle = user?.address || 'No address set';

  const handleItemClick = (path: string) => {
    onClose();
    if (path === '/location') {
      navigate(path, { state: { fromMenu: true } });
    } else {
      navigate(path);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
      {/* Close button */}
      <div className={`${responsivePx} pt-6 pb-2 my-4`}>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary"
        >
          <img src="/assets/menu close 2.svg" alt="Close" className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable menu content */}
      <div className={`flex-1 overflow-y-auto ${responsivePx} pb-24`}>
        {/* Profile row */}
        <button
          type="button"
          onClick={() => handleItemClick('/profile')}
          className="flex w-full items-center justify-between rounded-xl border border-muted/20 px-4 py-3 mb-4"
          style={{ backgroundColor: 'hsl(0, 0%, 15%)' }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
              <img
                src={profileImageSrc}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-base font-semibold text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground" title={displaySubtitle}>
                {displaySubtitle}
              </p>
            </div>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
            <img src="/assets/Back.svg" alt="Go" className="h-3 w-3 rotate-180" />
          </div>
        </button>

        {/* Menu items */}
        <div className="flex flex-col gap-4">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleItemClick(item.path)}
              className="flex w-full items-center justify-between rounded-xl border border-muted/20 px-4 py-3"
              style={{ backgroundColor: 'hsl(0, 0%, 15%)' }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black">
                  <img src={item.icon} alt="" className="h-4 w-4" />
                </div>
                <span className="text-foreground font-medium text-base">{item.label}</span>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                <img src="/assets/Back.svg" alt="Go" className="h-3 w-3 rotate-180" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MenuOverlay;
