import { useEffect } from 'react';

const ICON_STYLES_ID = 'flaticon-regular-rounded-styles';
const ICON_STYLES_HREF =
  'https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css';

export function loadIconStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(ICON_STYLES_ID)) return;

  const link = document.createElement('link');
  link.id = ICON_STYLES_ID;
  link.rel = 'stylesheet';
  link.href = ICON_STYLES_HREF;
  document.head.appendChild(link);
}

export function useIconStyles(shouldLoad = true) {
  useEffect(() => {
    if (shouldLoad) {
      loadIconStyles();
    }
  }, [shouldLoad]);
}
