// hooks/useKeyboardShortcuts.ts
import { useEffect, useRef } from "react";
import { useDesktop } from "../context/DesktopContext";

export const useKeyboardShortcuts = () => {
  const { state, dispatch } = useDesktop();
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use the ref to access the latest state
      const currentState = stateRef.current;

      // Alt+Tab to cycle windows
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();

        if (currentState.windows.length > 0) {
          const activeWindowIndex = currentState.windows.findIndex(
            (w) => w.id === currentState.activeWindowId
          );
          const nextIndex =
            (activeWindowIndex + 1) % currentState.windows.length;

          dispatch({
            type: "FOCUS_WINDOW",
            payload: { id: currentState.windows[nextIndex].id },
          });
        }
      }

      // Alt+F4 to close active window
      if (e.altKey && e.key === "F4") {
        e.preventDefault();

        if (currentState.activeWindowId) {
          dispatch({
            type: "CLOSE_WINDOW",
            payload: { id: currentState.activeWindowId },
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
// Only depend on dispatch since we're using the ref pattern
}, [dispatch]);
}