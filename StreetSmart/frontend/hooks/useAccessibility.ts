// ─── hooks/useAccessibility.ts ────────────────────────────────────

import { useState, useCallback } from 'react';

interface AccessibilityState {
  accessibilityMode: boolean;
  toggleAccessibility: () => void;
  highContrast: boolean;
  largeText: boolean;
}

export function useAccessibility(): AccessibilityState {
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const toggleAccessibility = useCallback(() => {
    setAccessibilityMode((v) => {
      const next = !v;
      // Apply high-contrast class to document root
      if (next) {
        document.documentElement.classList.add('a11y-mode');
      } else {
        document.documentElement.classList.remove('a11y-mode');
      }
      return next;
    });
  }, []);

  return {
    accessibilityMode,
    toggleAccessibility,
    highContrast: accessibilityMode,
    largeText:    accessibilityMode,
  };
}