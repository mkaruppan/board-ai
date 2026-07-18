import { useEffect, useRef } from 'react';

const isTypingTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
};

export function usePushToTalk(onStart: () => void, onStop: () => void, enabled: boolean) {
  const activeRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.code === 'Space' && e.ctrlKey && !activeRef.current) {
        e.preventDefault();
        activeRef.current = true;
        onStart();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activeRef.current) {
        e.preventDefault();
        activeRef.current = false;
        onStop();
      }
    };
    const handleBlur = () => {
      if (activeRef.current) {
        activeRef.current = false;
        onStop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, onStart, onStop]);
}
