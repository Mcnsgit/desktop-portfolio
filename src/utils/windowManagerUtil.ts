// Improved implementation for windowManagerUtil.ts

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

  // Track window position updates using a cleaner approach
  // Store all event listeners so we can remove them later
  const eventListeners: { type: string; handler: EventListener }[] = [];

  // Track when a window starts being dragged with proper event cleanup
  const mouseDownHandler = (e: MouseEvent) => {
    // Find the closest window element
    const windowElement = (e.target as HTMLElement).closest("[data-window-id]");
    if (!windowElement) return;

    const windowId = windowElement.getAttribute("data-window-id");
    if (!windowId) return;

    // Store the starting position
    const initialRect = windowElement.getBoundingClientRect();
    const startPos = { x: e.clientX, y: e.clientY };

    // Handler for mouse movement during drag
    const mouseMoveHandler = (moveEvent: MouseEvent) => {
      // Optionally add logic for live dragging feedback
    };

    // Handler for when dragging ends
    const mouseUpHandler = (upEvent: MouseEvent) => {
      const finalRect = windowElement.getBoundingClientRect();

      // Create and dispatch position update event
      const customEvent = new CustomEvent("window-position-update", {
        detail: {
          id: windowId,
          position: { x: finalRect.left, y: finalRect.top },
        },
      });
      document.dispatchEvent(customEvent);

      // Remove temporary event listeners
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };

    // Add temporary event listeners
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);

    // Save these so we can clean them up on destroy
    eventListeners.push(
      { type: "mousemove", handler: mouseMoveHandler as EventListener },
      { type: "mouseup", handler: mouseUpHandler as EventListener }
    );
  };

  containerElement.addEventListener("mousedown", mouseDownHandler as EventListener);
  eventListeners.push({ type: "mousedown", handler: mouseDownHandler as EventListener });

  // Add touch event support for mobile
  const touchStartHandler = (e: TouchEvent) => {
    if (e.touches.length !== 1) return; // Only handle single touch

    // Find the closest window element
    const windowElement = (e.target as HTMLElement).closest("[data-window-id]");
    if (!windowElement) return;

    const windowId = windowElement.getAttribute("data-window-id");
    if (!windowId) return;

    // Store the starting position
    const initialRect = windowElement.getBoundingClientRect();
    const touch = e.touches[0];
    const startPos = { x: touch.clientX, y: touch.clientY };

    // Handler for touch movement during drag
    const touchMoveHandler = (moveEvent: TouchEvent) => {
      // Optional: Add logic for live dragging feedback
    };

    // Handler for when touch ends
    const touchEndHandler = (endEvent: TouchEvent) => {
      const finalRect = windowElement.getBoundingClientRect();

      // Create and dispatch position update event
      const customEvent = new CustomEvent("window-position-update", {
        detail: {
          id: windowId,
          position: { x: finalRect.left, y: finalRect.top },
        },
      });
      document.dispatchEvent(customEvent);

      // Remove temporary event listeners
      document.removeEventListener("touchmove", touchMoveHandler);
      document.removeEventListener("touchend", touchEndHandler);
    };

    // Add temporary event listeners
    document.addEventListener("touchmove", touchMoveHandler);
    document.addEventListener("touchend", touchEndHandler);

    // Save these so we can clean them up on destroy
    eventListeners.push(
      { type: "touchmove", handler: touchMoveHandler as EventListener },
      { type: "touchend", handler: touchEndHandler as EventListener }
    );
  };

  containerElement.addEventListener("touchstart", touchStartHandler);
  eventListeners.push({ type: "touchstart", handler: touchStartHandler as EventListener });

  // Proper cleanup function that removes all event listeners
  const cleanup = () => {
    eventListeners.forEach(({ type, handler }) => {
      if (type.startsWith("mouse") || type === "touchstart") {
        containerElement.removeEventListener(type, handler);
      } else {
        document.removeEventListener(type, handler);
      }
    });
    eventListeners.length = 0; // Clear the array
  };

  // Override the destroy method to include our cleanup
  const originalDestroy = windowManagerInstance.destroy;
  windowManagerInstance.destroy = () => {
    cleanup();
    originalDestroy.call(windowManagerInstance);
  };

  // Make instance available globally for debugging
  (window as any).swapyWindowManager = windowManagerInstance;

  return windowManagerInstance;
};

// Other methods remain largely the same
export const updateWindowManager = (): boolean => {
  if (windowManagerInstance) {
    windowManagerInstance.update();
    return true;
  }
  return false;
};

export const getWindowManager = (): Swapy | null => {
  return windowManagerInstance;
};

export const destroyWindowManager = (): boolean => {
  if (windowManagerInstance) {
    windowManagerInstance.destroy();
    windowManagerInstance = null;
    (window as any).swapyWindowManager = null;
    return true;
  }
  return false;
};

export const bringWindowToFront = (windowId: string): boolean => {
  if (!windowManagerInstance) return false;

  // Find the window element
  const windowElement = document.querySelector(
    `[data-window-id="${windowId}"]`
  );
  if (!windowElement) return false;

  // Focus the window to bring it to front
  (windowElement as HTMLElement).click();
  return true;
};
