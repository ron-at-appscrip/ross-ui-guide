import { useEffect, useMemo } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const memoizedShortcuts = useMemo(() => shortcuts, [shortcuts]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchingShortcut = memoizedShortcuts.find(shortcut => {
        return (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrl &&
          !!event.shiftKey === !!shortcut.shift &&
          !!event.altKey === !!shortcut.alt
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [memoizedShortcuts]);
};

// Common shortcuts for client details
export const useClientDetailShortcuts = (actions: {
  onEdit?: () => void;
  onNewMatter?: () => void;
  onCall?: () => void;
  onEmail?: () => void;
  onSwitchTab?: (tab: string) => void;
  isEnabled?: boolean;
}) => {
  useEffect(() => {
    if (!actions.isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when enabled
      if (!actions.isEnabled) return;

      const shortcuts: { [key: string]: () => void } = {
        'ctrl+e': () => actions.onEdit?.(),
        'ctrl+m': () => actions.onNewMatter?.(),
        'ctrl+p': () => actions.onCall?.(),
        'ctrl+enter': () => actions.onEmail?.(),
        'ctrl+1': () => actions.onSwitchTab?.('matters'),
        'ctrl+2': () => actions.onSwitchTab?.('billing'),
        'ctrl+3': () => actions.onSwitchTab?.('communications'),
        'ctrl+4': () => actions.onSwitchTab?.('documents'),
        'ctrl+5': () => actions.onSwitchTab?.('overview'),
      };

      const key = [
        event.ctrlKey && 'ctrl',
        event.shiftKey && 'shift',
        event.altKey && 'alt',
        event.key.toLowerCase()
      ].filter(Boolean).join('+');

      const handler = shortcuts[key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions.onEdit, actions.onNewMatter, actions.onCall, actions.onEmail, actions.onSwitchTab, actions.isEnabled]);
};