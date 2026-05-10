import React from 'react';

/**
 * Dim/blur layer behind modal / overlay panels. Used by `OverlayChoiceModal`, `ResendOverlay`,
 * wallet deposit expand, etc. — change classes here once to update every overlay backdrop.
 */
export const OVERLAY_MODAL_BACKDROP_LAYER_CLASSNAME =
  'absolute inset-0 bg-black/10 backdrop-blur-[1px]';

const OverlayModalBackdropLayer: React.FC = () => (
  <div className={OVERLAY_MODAL_BACKDROP_LAYER_CLASSNAME} aria-hidden />
);

export default OverlayModalBackdropLayer;
