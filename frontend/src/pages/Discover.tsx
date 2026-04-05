import BackButton from '../components/BackButton';
import BottomNav from '../components/BottomNav';
import { responsivePx } from '../constants/responsive';

const Discover = () => (
  <div className="flex min-h-screen flex-col bg-[#1a1a1a] font-[var(--font-poppins)]">
    <header className={`${responsivePx} pb-4 pt-10`}>
      <BackButton
        variant="map"
        title="Discover"
        titleClassName="text-white"
      />
    </header>
    <main className={`${responsivePx} flex-1 pb-28`} />
    <BottomNav />
  </div>
);

export default Discover;
