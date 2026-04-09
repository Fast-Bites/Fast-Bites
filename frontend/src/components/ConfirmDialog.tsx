import React from 'react';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Yes',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="bg-overlay-panel-background rounded-2xl p-6 mx-6 w-full max-w-sm animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-foreground text-lg font-semibold text-center mb-2">{title}</h3>
        {message && <p className="text-muted-foreground text-sm text-center mb-6">{message}</p>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-full border border-muted/30 text-foreground font-medium transition-opacity hover:opacity-80"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-full font-medium transition-opacity hover:opacity-80 ${
              confirmVariant === 'danger'
                ? 'bg-[hsl(0,84%,60%)] text-foreground'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
