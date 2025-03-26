import React from "react";
import { useDesktop } from "../../context/DesktopContext";
import MobileWindow from "./MobileWindow";
import styles from "../styles/MobileWindowManager.module.scss";

const MobileWindowManager: React.FC = () => {
  const { state, dispatch } = useDesktop();

  // Filter for open windows
  const openWindows = state.windows.filter((window) => !window.minimized);

  if (openWindows.length === 0) return null;

  // In mobile view, only show the most recently opened window
  const topWindow = openWindows[openWindows.length - 1];

  return (
    <div className={styles.mobileWindowManager}>
      <MobileWindow window={topWindow} />

      {/* If there are multiple windows open, show a window switcher */}
      {openWindows.length > 1 && (
        <div className={styles.windowSwitcher}>
          {openWindows.map((window, index) => (
            <button
              key={window.id}
              className={`${styles.switcherButton} ${
                window.id === topWindow.id ? styles.active : ""
              }`}
              onClick={() => {
                // Move this window to the top of the stack
                dispatch({
                  type: "FOCUS_WINDOW",
                  payload: { id: window.id },
                });
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileWindowManager;
