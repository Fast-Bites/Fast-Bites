/**
 * Named color tokens. Prefer Tailwind utilities from `@theme` in `src/index.css`
 * (e.g. `bg-overlay-panel-background`).
 */
export const colors = {
  /** Overlay modal panel fill — `--color-overlay-panel-background` in index.css */
  overlayPanelBackground: '#272727',
  /** Brand green — Order congratulations modal only; use `popupGreen` elsewhere */
  appGreen: '#00AF00',
  /** Popup lime — `--color-popup-green` in index.css */
  popupGreen: '#00FF00',
} as const;
