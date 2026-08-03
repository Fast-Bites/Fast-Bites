import { Fragment, type ReactNode } from 'react';
import Button from '@/components/Button';
import { registrationBackgroundUrl } from '@/components/RegistrationPageShell';

/** Space between the Next button and the bottom of the screen — try pb-8, pb-10, pb-12, pb-16 */
export const registrationNextBottomSpacingClassName = 'pb-10';

export const registrationStepFooterClassName = `mt-auto shrink-0 pt-6 ${registrationNextBottomSpacingClassName}`;

/** Fixed bottom Next bar — optional top divider matching the page column width. */
export const registrationStickyStepFooterClassName = [
  'shrink-0 bg-cover bg-bottom pt-0',
  registrationNextBottomSpacingClassName,
].join(' ');

/** Full width of the mother page column (not wider than the page). */
export const registrationStickyStepFooterDividerClassName = 'mb-2.5 w-full border-gray-400';
export const registrationPageHeaderClassName = 'text-center';

export const registrationPageTitleClassName = 'text-4xl font-bold text-gray-900';

export const registrationPageSubtitleClassName = 'mt-2 text-base text-gray-600';

export const registrationStepperClassName =
  'mx-auto mt-7 mb-10 flex w-full max-w-[100%] items-center sm:max-w-[65%]';

export const registrationStepCircleActiveClassName =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-white';

export const registrationStepCircleClassName =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-400 bg-transparent text-base font-semibold text-gray-400';

export const registrationStepConnectorClassName = 'mx-1 h-px min-w-2 flex-1 bg-gray-400';

export const registrationStepConnectorActiveClassName = 'mx-1 h-px min-w-2 flex-1 bg-primary';

export const registrationSectionTitleClassName = 'text-2xl font-bold text-gray-900';

export const registrationSectionDescriptionClassName = 'text-base text-gray-600';

export const registrationSectionDividerClassName = 'mt-1 mb-6 border-gray-400';

export const registrationTextLinkClassName =
  'text-xs font-normal text-blue-600 underline-offset-2 hover:underline';

export function RegistrationTextLink({
  children,
  onClick,
  className,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        registrationTextLinkClassName,
        disabled ? 'cursor-not-allowed text-gray-400 hover:no-underline' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}

interface RegistrationStepperProps {
  activeStep: number;
  totalSteps?: number;
}

export function RegistrationStepper({ activeStep, totalSteps = 4 }: RegistrationStepperProps) {
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

  return (
    <div className={registrationStepperClassName}>
      {steps.map((step, index) => (
        <Fragment key={step}>
          <div
            className={
              step <= activeStep
                ? registrationStepCircleActiveClassName
                : registrationStepCircleClassName
            }
          >
            {step}
          </div>
          {index < steps.length - 1 ? (
            <div
              className={
                activeStep > index + 1
                  ? registrationStepConnectorActiveClassName
                  : registrationStepConnectorClassName
              }
            />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

export function RegistrationSkipButton({
  onClick,
  children = 'Skip',
}: {
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-normal text-gray-900 transition-opacity hover:opacity-80"
    >
      {children}
    </button>
  );
}

/** Simple text-style back control (←) matching Skip placement. */
export function RegistrationBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back"
      className="text-lg font-normal leading-none text-gray-900 transition-opacity hover:opacity-80"
    >
      ←
    </button>
  );
}

interface RegistrationPageTitleProps {
  title: string;
  subtitle: string;
  className?: string;
}

/** Page title + subtitle only (no stepper) — used on documentation and post-registration screens. */
export function RegistrationPageTitle({ title, subtitle, className }: RegistrationPageTitleProps) {
  return (
    <div className={[registrationPageHeaderClassName, className].filter(Boolean).join(' ')}>
      <h1 className={registrationPageTitleClassName}>{title}</h1>
      <p className={registrationPageSubtitleClassName}>{subtitle}</p>
    </div>
  );
}

interface RegistrationPageHeaderProps {
  title: string;
  subtitle: string;
  activeStep: number;
  totalSteps?: number;
}

export function RegistrationPageHeader({
  title,
  subtitle,
  activeStep,
  totalSteps = 4,
}: RegistrationPageHeaderProps) {
  return (
    <>
      <RegistrationPageTitle title={title} subtitle={subtitle} />
      <RegistrationStepper activeStep={activeStep} totalSteps={totalSteps} />
    </>
  );
}

interface RegistrationSectionHeaderProps {
  title: string;
  description: string;
}

export function RegistrationSectionHeader({ title, description }: RegistrationSectionHeaderProps) {
  return (
    <>
      <h2 className={registrationSectionTitleClassName}>{title}</h2>
      <p className={registrationSectionDescriptionClassName}>{description}</p>
      <hr className={registrationSectionDividerClassName} />
    </>
  );
}

interface RegistrationStepFooterProps {
  onNext: () => void;
  label?: string;
  disabled?: boolean;
  /** Pin to the bottom of a fillViewport shell; list content scrolls above it. */
  sticky?: boolean;
  /** Top divider matching the page column width (e.g. only after a Menu Setup option is chosen). */
  showDivider?: boolean;
  children?: ReactNode;
}

export function RegistrationStepFooter({
  onNext,
  label = 'Next',
  disabled = false,
  sticky = false,
  showDivider = false,
  children,
}: RegistrationStepFooterProps) {
  return (
    <div
      className={sticky ? registrationStickyStepFooterClassName : registrationStepFooterClassName}
      style={sticky ? { backgroundImage: `url("${registrationBackgroundUrl}")` } : undefined}
    >
      {sticky && showDivider ? (
        <hr className={registrationStickyStepFooterDividerClassName} />
      ) : sticky ? (
        <div className="pt-3" />
      ) : null}
      {children}
      <Button type="button" variant="primary" onClick={onNext} disabled={disabled}>
        {label}
      </Button>
    </div>
  );
}
