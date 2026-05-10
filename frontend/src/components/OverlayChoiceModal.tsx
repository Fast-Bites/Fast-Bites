import React from 'react';
import OverlayModalBackdropLayer from './OverlayModalBackdropLayer';

/** `green` = popup lime (Yes/No). `app-green` = brand green (e.g. legacy modal actions). */
export type OverlayModalActionVariant = 'green' | 'app-green' | 'primary' | 'outline-green';

export interface OverlayModalAction {
  label: string;
  variant: OverlayModalActionVariant;
  onClick: () => void;
}

interface OverlayChoiceModalProps {
  open: boolean;
  onBackdropClick?: () => void;
  title: string;
  titleClassName?: string;
  message?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  /** Ignored when `footer` is set. */
  actions?: OverlayModalAction[];
  /** Cart-style side-by-side vs stacked pills (e.g. order complete). */
  actionsLayout?: 'row' | 'column';
  panelClassName?: string;
  /**
   * Custom actions (e.g. auth `Button` components). When set, `actions` is ignored.
   * Use for Order congratulations: extra vertical space icon → copy → buttons.
   */
  footer?: React.ReactNode;
}

function actionClass(variant: OverlayModalActionVariant, layout: 'row' | 'column'): string {
  const rowBase =
    'flex-1 min-w-0 rounded-md py-2 text-center text-sm font-semibold transition-opacity hover:opacity-80';
  const colBase =
    'w-full rounded-md py-2 text-center text-sm font-semibold transition-opacity hover:opacity-80';

  if (layout === 'column') {
    switch (variant) {
      case 'green':
        return `${colBase} bg-popup-green text-black`;
      case 'app-green':
        return `${colBase} bg-app-green text-black`;
      case 'primary':
        return `${colBase} bg-primary text-primary-foreground`;
      case 'outline-green':
        return `${colBase} border-2 border-app-green bg-transparent text-app-green`;
    }
  }

  switch (variant) {
    case 'green':
      return `${rowBase} bg-popup-green text-black`;
    case 'app-green':
      return `${rowBase} bg-app-green text-black`;
    case 'primary':
      return `${rowBase} bg-primary text-primary-foreground`;
    case 'outline-green':
      return `${rowBase} border-2 border-app-green bg-transparent text-app-green`;
  }
}

const OverlayChoiceModal: React.FC<OverlayChoiceModalProps> = ({
  open,
  onBackdropClick,
  title,
  titleClassName = 'text-base font-medium',
  message,
  imageSrc,
  imageAlt = '',
  actions = [],
  actionsLayout = 'row',
  panelClassName = '',
  footer,
}) => {
  if (!open) return null;

  const actionsClass =
    actionsLayout === 'column'
      ? 'flex w-full min-w-[200px] flex-col gap-3'
      : 'flex w-full min-w-[200px] gap-12';

  const useFooter = Boolean(footer);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onBackdropClick}
      role="presentation"
    >
      <OverlayModalBackdropLayer />
      <div
        className={`relative z-10 flex flex-col items-center rounded-xl border border-white/15 bg-overlay-panel-background shadow-lg backdrop-blur-md ${
          useFooter ? 'gap-0' : 'gap-4 px-5 py-4'
        } ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {useFooter ? (
          <>
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={imageAlt}
                className="mx-auto mb-8 h-32 w-32 object-contain"
              />
            ) : null}
            <div className="mb-10 flex w-full flex-col items-center gap-1 text-center">
              <p className={`text-foreground ${titleClassName}`}>{title}</p>
              {message != null ? message : null}
            </div>
            <div className="flex w-full flex-col gap-3">{footer}</div>
          </>
        ) : (
          <>
            {imageSrc ? (
              <img src={imageSrc} alt={imageAlt} className="mx-auto h-32 w-32 object-contain" />
            ) : null}
            <p className={`text-center text-foreground ${titleClassName}`}>{title}</p>
            {message ? (
              <div className="max-w-xs text-center text-sm leading-relaxed text-foreground/70">{message}</div>
            ) : null}
            <div className={actionsClass}>
              {actions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.onClick}
                  className={actionClass(a.variant, actionsLayout)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OverlayChoiceModal;
