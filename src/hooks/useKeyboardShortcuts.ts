// hooks/useKeyboardShortcuts.ts
import { useEffect, useRef } from "react";
import { Desktop as DesktopModel } from "../model/Desktop";

interface UseKeyboardShortcutsProps {
  desktopModel: DesktopModel | null;
  onToggleStartMenu: () => void;
  forceUpdate: () => void;
}

export const useKeyboardShortcuts = ({ 
  desktopModel, 
  onToggleStartMenu, 
  forceUpdate 
}: UseKeyboardShortcutsProps) => {
  const desktopModelRef = useRef(desktopModel);
  useEffect(() => {
    desktopModelRef.current = desktopModel;
  }, [desktopModel]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentDesktopModel = desktopModelRef.current;
      if (!currentDesktopModel) return;

      // Alt+Tab to cycle windows
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();

        const windows = currentDesktopModel.windowManager.getWindowsForUI();
        if (windows.length > 0) {
          const focusedWindow = currentDesktopModel.windowManager.getFocusedWindow();
          const activeWindowIndex = windows.findIndex(w => w.id === focusedWindow?.id);
          const nextIndex = (activeWindowIndex + 1) % windows.length;
          
          currentDesktopModel.windowManager.setFocus(windows[nextIndex].id);
          forceUpdate();
        }
      }

      // Alt+F4 to close active window
      if (e.altKey && e.key === "F4") {
        e.preventDefault();

        const focusedWindow = currentDesktopModel.windowManager.getFocusedWindow();
        if (focusedWindow) {
          currentDesktopModel.windowManager.closeWindow(focusedWindow.id);
          forceUpdate();
        }
      }

      // Windows key or Ctrl+Esc to toggle start menu
      if (e.key === "Meta" || (e.ctrlKey && e.key === "Escape")) {
        e.preventDefault();
        onToggleStartMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onToggleStartMenu, forceUpdate]);
}