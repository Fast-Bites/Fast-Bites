import type { ReactNode } from 'react';

export const registrationBackgroundUrl = `${import.meta.env.BASE_URL}assets/Admin bg.png`;

interface RegistrationPageShellProps {
  children: ReactNode;
  /** Lock to viewport height so a sticky footer can sit above a scrolling body. */
  fillViewport?: boolean;
}

export default function RegistrationPageShell({
  children,
  fillViewport = false,
}: RegistrationPageShellProps) {
  return (
    <div
      className={[
        'flex w-full flex-col bg-cover bg-center bg-no-repeat',
        fillViewport ? 'h-dvh overflow-hidden' : 'min-h-screen',
      ].join(' ')}
      style={{ backgroundImage: `url("${registrationBackgroundUrl}")` }}
    >
      <div
        className={[
          'mx-auto flex w-full max-w-6xl flex-1 flex-col bg-transparent px-4 sm:px-20',
          fillViewport ? 'min-h-0 pt-12' : 'py-12',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </div>
  );
}
