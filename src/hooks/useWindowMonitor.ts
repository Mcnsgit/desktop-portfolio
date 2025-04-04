// src/hooks/useWindowMonitor.ts - Fixed version
import { useEffect, useRef, useCallback } from "react";
import { useDesktop } from "../context/DesktopContext";
import { ensureWindowVisibility } from "../utils/windowServices/WindowPositionService";
import { WINDOW_POSITIONS, TIMING } from "../utils/constants/windowConstants";

/**
 * Hook to monitor window positions and ensure they stay visible
 * Particularly prevents windows from being below the taskbar
 */
export const useWindowMonitor = () => {
  const { state, dispatch } = useDesktop();
  const isProcessingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract this function to use with useCallback for proper dependencies
  const checkWindowPositions = useCallback(() => {
    if (isProcessingRef.current || state.windows.length === 0) return;
    isProcessingRef.current = true;

    // Look for visible windows
    const visibleWindows = state.windows.filter((window) => !window.minimized);

    // Identify windows that need position adjustment
    const windowsToAdjust = visibleWindows.filter((win) => {
      const position = win.position;
      const size = win.size || { width: 500, height: 400 };

      // Check if window bottom extends beyond viewport height - taskbar
      if (typeof window !== "undefined") {
        const viewportHeight =
          window.innerHeight - WINDOW_POSITIONS.TASKBAR_HEIGHT;
        if (position.y + size.height > viewportHeight) {
          return true;
        }
      }

      // Check if window is below minimum y position (could be below taskbar)
      if (position.y < WINDOW_POSITIONS.BASE_OFFSET_Y) {
        return true;
      }

      // Check if window extends beyond right edge of screen
      if (typeof window !== "undefined") {
        const viewportWidth = window.innerWidth;
        if (position.x + size.width > viewportWidth) {
          return true;
        }
      }

      return false;
    });

    // Adjust windows that need fixing
    if (windowsToAdjust.length > 0) {
      console.log(`Adjusting positions for ${windowsToAdjust.length} windows`);

      // Use batch updates if available to reduce renders
      const updates = windowsToAdjust
        .map((window) => {
          const validPosition = ensureWindowVisibility(
            window.position,
            window.size || { width: 500, height: 400 }
          );

          // Only update if position changed significantly
          if (
            Math.abs(validPosition.x - window.position.x) > 5 ||
            Math.abs(validPosition.y - window.position.y) > 5
          ) {
            return {
              id: window.id,
              position: validPosition,
            };
          }
          return null;
        })
        .filter(Boolean);

      // Apply all updates
      updates.forEach((update) => {
        if (update) {
          dispatch({
            type: "UPDATE_WINDOW_POSITION",
            payload: update,
          });
        }
      });
    }

    isProcessingRef.current = false;
  }, [state.windows, dispatch]);

  // Debounced window resize handler
  const handleResize = useCallback(() => {
    if (isProcessingRef.current) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the check to avoid too frequent updates
    timeoutRef.current = setTimeout(() => {
      checkWindowPositions();
      timeoutRef.current = null;
    }, TIMING.POSITION_UPDATE_DEBOUNCE);
  }, [checkWindowPositions]);

  // Run check when windows change
  useEffect(() => {
    // Only run if there are windows to check
    if (state.windows.length > 0) {
      checkWindowPositions();
    }
  }, [state.windows, checkWindowPositions]);

  // Add resize listener
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [handleResize]);
};
