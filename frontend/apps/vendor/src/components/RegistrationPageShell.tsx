import type { ReactNode } from 'react';

export const registrationBackgroundUrl = `${import.meta.env.BASE_URL}assets/Admin bg.png`;

interface RegistrationPageShellProps {
  children: ReactNode;
}

export default function RegistrationPageShell({ children }: RegistrationPageShellProps) {
  return (
    <div
      className="flex min-h-screen w-full flex-col bg-cover bg-center bg-no-repeat px-4 py-12 sm:px-8 sm:py-12"
      style={{ backgroundImage: `url("${registrationBackgroundUrl}")` }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col bg-transparent sm:px-12">
        {children}
      </div>
    </div>
  );
}
