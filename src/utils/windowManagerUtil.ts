// utils/windowManagerUtil.ts
import { createSwapy, Swapy } from "swapy";

// Keep a reference to the window manager instance
let windowManagerInstance: Swapy | null = null;

/**
 * Initialize a SWAPY instance for window management
 * @param containerElement DOM element that contains windows
 * @returns SWAPY instance
 */
export const initializeWindowManager = (
  containerElement: HTMLElement
): Swapy => {
  // Clean up any existing instance
  if (windowManagerInstance) {
    windowManagerInstance.destroy();
  }

  // Create a new instance
  windowManagerInstance = createSwapy(containerElement, {
    animation: "dynamic",
    dragAxis: "both",
    autoScrollOnDrag: true,
    manualSwap: true, // Required for React
    swapMode: "drop", // Only swap when dropped
  });

  // Add event logging for debugging
  windowManagerInstance.onSwapStart((event) => {
    console.log("Window drag started:", event);
  });

  windowManagerInstance.onSwapEnd((event) => {
    console.log("Window drag ended:", event);
  });

  // Make it available globally for debugging
  (window as any).swapyWindowManager = windowManagerInstance;

  return windowManagerInstance;
};

/**
 * Update the SWAPY instance when windows change
 * @returns boolean indicating success
 */
export const updateWindowManager = (): boolean => {
  if (windowManagerInstance) {
    windowManagerInstance.update();
    return true;
  }
  return false;
};

/**
 * Get the current SWAPY window manager instance
 * @returns Current SWAPY instance or null
 */
export const getWindowManager = (): Swapy | null => {
  return windowManagerInstance;
};

/**
 * Destroy the SWAPY window manager instance
 * @returns boolean indicating success
 */
export const destroyWindowManager = (): boolean => {
  if (windowManagerInstance) {
    windowManagerInstance.destroy();
    windowManagerInstance = null;
    (window as any).swapyWindowManager = null;
    return true;
  }
  return false;
};
