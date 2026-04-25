import { useCallback, useEffect, useState } from 'react';
import { sfx } from './sfx';

/**
 * React hook around the global `sfx` module.
 *
 * - Tracks mute state in React, kept in sync with localStorage via `sfx`.
 * - The first call to any `sfx.*` method during a user gesture will lazily
 *   create and resume the AudioContext, so no extra wiring is needed here.
 */
export function useSfx(): {
  sfx: typeof sfx;
  muted: boolean;
  toggleMute: () => void;
} {
  const [muted, setMutedState] = useState<boolean>(() => sfx.isMuted());

  // Re-sync if another tab/component changes the persisted mute flag.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sfx-muted') {
        setMutedState(sfx.isMuted());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !sfx.isMuted();
    sfx.setMuted(next);
    setMutedState(next);
  }, []);

  return { sfx, muted, toggleMute };
}
