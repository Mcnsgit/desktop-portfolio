// // src/hooks/useWindowMonitor.ts
// import { useEffect, useRef, useCallback } from "react";

// import { ensureWindowVisibility } from "../utils/windowServices/WindowPositionService";
// import { TASKBAR_HEIGHT } from "../utils/constants/windowConstants";
// import { WindowState } from "@/config/constants";

// const TIMING = {
//   POSITION_UPDATE_DEBOUNCE: 100, // ms
// };

// /**
//  * Hook to monitor window positions and ensure they stay visible
//  * Particularly prevents windows from being below the taskbar
//  */
// export const useWindowMonitor = (desktopModel: DesktopModel | null) => {
//   const isProcessingRef = useRef(false);
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Extract this function to use with useCallback for proper dependencies
//   const checkWindowPositions = useCallback(() => {
//     if (isProcessingRef.current || !desktopModel) return;

//     const windows = desktopModel.windowManager.getWindowsForUI();
//     if (windows.length === 0) return;

//     isProcessingRef.current = true;

//     // Look for visible windows
//     const visibleWindows = windows.filter((window) => window.state !== WindowState.MINIMIZED);

//     // Identify windows that need position adjustment
//     const windowsToAdjust = visibleWindows.filter((win) => {
//       const position = win.position;
//       const size = win.size || { width: 500, height: 400 };

//       // Check if window bottom extends beyond viewport height - taskbar
//       if (typeof window !== "undefined") {
//         const viewportHeight = window.innerHeight - TASKBAR_HEIGHT;
//         if (position.y + size.height > viewportHeight) {
//           return true;
//         }
//       }

//       // Check if window is off top of screen
//       if (position.y < 0) {
//         return true;
//       }

//       // Check if window extends beyond right edge of screen
//       if (typeof window !== "undefined") {
//         const viewportWidth = window.innerWidth;
//         if (position.x + size.width > viewportWidth) {
//           return true;
//         }
//       }

//       // Check if window is off left of screen
//       if (position.x < 0) {
//           return true;
//       }

//       return false;
//     });

//     // Adjust windows that need fixing
//     if (windowsToAdjust.length > 0) {
//       console.log(`Adjusting positions for ${windowsToAdjust.length} windows`);

//       const updates = windowsToAdjust
//         .map((window) => {
//           const validPosition = ensureWindowVisibility(
//             window.position,
//             window.size || { width: 500, height: 400 }
//           );

//           // Only update if position changed significantly
//           if (
//             Math.abs(validPosition.x - window.position.x) > 1 ||
//             Math.abs(validPosition.y - window.position.y) > 1
//           ) {
//             return {
//               id: window.id,
//               position: validPosition,
//             };
//           }
//           return null;
//         })
//         .filter((p): p is { id: string; position: {x: number, y: number} } => p !== null);

//       // Apply all updates via the window manager
//       updates.forEach((update) => {
//         if (update) {
//             desktopModel.windowManager.updateWindowPosition(update.id, update.position);
//         }
//       });
//     }

//     isProcessingRef.current = false;
//   }, [desktopModel]);

//   // Debounced window resize handler
//   const handleResize = useCallback(() => {
//     if (isProcessingRef.current) return;

//     // Clear any existing timeout
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }

//     // Debounce the check to avoid too frequent updates
//     timeoutRef.current = setTimeout(() => {
//       checkWindowPositions();
//       timeoutRef.current = null;
//     }, TIMING.POSITION_UPDATE_DEBOUNCE);
//   }, [checkWindowPositions]);

//   // Run check when windows change (via the desktop model subscription)
//   useEffect(() => {
//     if (!desktopModel) return;

//     // The subscription in useDesktopModel will trigger re-renders,
//     // which in turn will call this effect if the model's state (and thus its identity or a derived value) changes.
//     // We can directly call the check here, which will run whenever Desktop.tsx re-renders due to a model update.
//     checkWindowPositions();
//   }, [desktopModel, checkWindowPositions]); // Re-run if the model instance changes or the checker function is redefined

//   // Add resize listener
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       window.addEventListener("resize", handleResize);

//       return () => {
//         window.removeEventListener("resize", handleResize);
//         if (timeoutRef.current) {
//           clearTimeout(timeoutRef.current);
//         }
//       };
//     }
//   }, [handleResize]);
// };
