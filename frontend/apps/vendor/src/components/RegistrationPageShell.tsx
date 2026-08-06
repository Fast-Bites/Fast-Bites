import type { ReactNode } from 'react';

export const registrationBackgroundUrl = `${import.meta.env.BASE_URL}assets/Admin bg.png`;

/**
 * Side inset on the mixed-color background parent (Admin bg).
 * Padding lives on that parent so the gutters still show the image.
 * Below `sm`: moderate fixed inset. `sm`+ unchanged.
 */
export const registrationPageXClassName = 'px-5 max-[419px]:px-3 sm:px-20';

/** Cancels the background-parent side inset so a rule can touch its edges. */
export const registrationPageXBleedClassName = '-mx-5 max-[419px]:-mx-3 sm:-mx-20';

interface RegistrationPageShellProps {
  children: ReactNode;
  /** Lock to viewport height so a sticky footer can sit above a scrolling body. */
  fillViewport?: boolean;
}

/**
 * Parent = full-bleed mixed-color Admin background.
 * Horizontal inset is padding on that parent so elements sit in from the bg edges.
 */
export default function RegistrationPageShell({
  children,
  fillViewport = false,
}: RegistrationPageShellProps) {
  return (
    <div
      className={[
        'flex w-full flex-col bg-cover bg-center bg-no-repeat',
        registrationPageXClassName,
        fillViewport ? 'h-dvh overflow-hidden' : 'min-h-screen',
      ].join(' ')}
      style={{ backgroundImage: `url("${registrationBackgroundUrl}")` }}
    >
      <div
        className={[
          'mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col bg-transparent',
          fillViewport ? 'min-h-0 pt-12 max-[500px]:pt-6' : 'py-12 max-[500px]:py-6',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </div>
  );
}
