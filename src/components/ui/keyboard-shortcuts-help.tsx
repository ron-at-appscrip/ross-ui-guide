import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResponsiveModal from '@/components/ui/responsive-modal';
import { Keyboard, Command } from 'lucide-react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts?: KeyboardShortcut[];
}

const KeyboardShortcutsHelp = ({ shortcuts = [] }: KeyboardShortcutsHelpProps) => {
  const [showHelp, setShowHelp] = useState(false);

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys = [];
    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.shift) keys.push('Shift');
    if (shortcut.alt) keys.push('Alt');
    keys.push(shortcut.key.toUpperCase());
    return keys.join(' + ');
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 z-50 bg-background shadow-lg border"
        title="Keyboard Shortcuts (Ctrl + ?)"
      >
        <Keyboard className="h-4 w-4" />
      </Button>

      <ResponsiveModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Keyboard Shortcuts"
        description="Speed up your workflow with these keyboard shortcuts"
        size="md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Available Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                  <span className="text-sm">{shortcut.description}</span>
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </ResponsiveModal>
    </>
  );
};

export default KeyboardShortcutsHelp;