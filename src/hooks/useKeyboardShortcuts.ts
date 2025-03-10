// hooks/useKeyboardShortcuts.ts
import { useEffect } from "react";
import { useDesktop } from "../context/DesktopContext";

export const useKeyboardShortcuts = () => {
  const { state, dispatch } = useDesktop();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Tab to cycle windows
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();

        if (state.windows.length > 0) {
          const activeWindowIndex = state.windows.findIndex(
            (w) => w.id === state.activeWindowId
          );
          const nextIndex = (activeWindowIndex + 1) % state.windows.length;

          dispatch({
            type: "FOCUS_WINDOW",
            payload: { id: state.windows[nextIndex].id },
          });
        }
      }

      // Alt+F4 to close active window
      if (e.altKey && e.key === "F4") {
        e.preventDefault();

        if (state.activeWindowId) {
          dispatch({
            type: "CLOSE_WINDOW",
            payload: { id: state.activeWindowId },
          });
        }
      }

      // Windows key or Ctrl+Esc to toggle start menu
      if (e.key === "Meta" || (e.ctrlKey && e.key === "Escape")) {
        e.preventDefault();
        dispatch({ type: "TOGGLE_START_MENU" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [state.windows, state.activeWindowId, dispatch]);
};
