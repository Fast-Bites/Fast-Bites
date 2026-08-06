import { ArrowUp } from 'lucide-react';

export const scrollToTopButtonClassName = [
  'absolute bottom-full right-0 z-30 mb-3',
  'flex h-14 w-14 items-center justify-center rounded-full text-white',
  'transition hover:opacity-90 active:opacity-80',
  'max-[500px]:mb-2 max-[500px]:h-12 max-[500px]:w-12',
].join(' ');

/**
 * Figma glass chip (vendor scroll-up):
 * - Fill: #2C2C2C @ 20%
 * - Border: 1px center, dual white→transparent (#000 @ 0%) gradient mix
 * - Drop shadow: X0 Y1 blur5 spread2, #000 @ 25%
 * - Backdrop blur: 35
 * Icon matches customer Home “Back to top” up-arrow.
 */
export const scrollToTopButtonStyle = {
  backgroundColor: 'rgba(44, 44, 44, 0.2)',
  backgroundImage: [
    'linear-gradient(rgba(44, 44, 44, 0.2), rgba(44, 44, 44, 0.2))',
    'linear-gradient(160deg, rgba(255, 255, 255, 0.55) 0%, rgba(0, 0, 0, 0) 55%)',
    'linear-gradient(340deg, rgba(255, 255, 255, 0.35) 0%, rgba(0, 0, 0, 0) 50%)',
  ].join(', '),
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box, border-box',
  border: '1px solid transparent',
  backdropFilter: 'blur(35px)',
  WebkitBackdropFilter: 'blur(35px)',
  boxShadow: '0 1px 5px 2px rgba(0, 0, 0, 0.25)',
} as const;

interface ScrollToTopButtonProps {
  visible: boolean;
  onClick: () => void;
}

export default function ScrollToTopButton({ visible, onClick }: ScrollToTopButtonProps) {
  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Scroll to top"
      className={scrollToTopButtonClassName}
      style={scrollToTopButtonStyle}
    >
      {/*
        Home uses /assets/Back to top.png (full chip). That PNG bakes its own fill,
        so we recreate the chip from Figma and keep the same white up-arrow glyph.
      */}
      <ArrowUp className="h-6 w-6 max-[500px]:h-5 max-[500px]:w-5" strokeWidth={2.25} />
    </button>
  );
}
