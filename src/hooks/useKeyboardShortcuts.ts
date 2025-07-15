// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';
//  import {Window} from '../types ';

interface UseKeyboardShortcutsProps {

  onToggleStartMenu: () => void;
  }

export const useKeyboardShortcuts = ({ 
  onToggleStartMenu, 
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {

        // Handle window-related shortcuts
        if (e.key === 'Escape') {
            // const focusedWindow = desktopModel.windowManager.getFocusedWindow();
            // if (focusedWindow) {
            //     // desktopModel.windowManager.closeWindow(focusedWindow.id);
            // }
        }
        
        // Handle start menu toggle
        if (e.key === 'Meta' || e.key === 'OS') {
            e.preventDefault();
            onToggleStartMenu();
        }

        // The 'Delete' key functionality is handled inside Desktop.tsx's own keydown listener
        // to have access to the `selectedItems` state.

        // Refresh action
        if (e.key === 'F5') {
            e.preventDefault();
            // The model itself doesn't have a "refresh" concept, this is a UI action.
            // If we still want to support it, we'd call `notifyDesktopUpdate()` directly.
            // For now, we'll assume a browser refresh is sufficient.
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onToggleStartMenu]);
};