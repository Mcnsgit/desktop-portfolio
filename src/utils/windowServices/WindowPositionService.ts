// src/utils/windowServices/WindowPositionService.ts
import {
  TASKBAR_HEIGHT,
  DEFAULT_CASCADE_OFFSET,
  MIN_VISIBLE_WINDOW_EDGE,
  WINDOW_SIZES,
  DEFAULT_WINDOW_POSITION,
} from "../constants";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Window {
  id: string;
  position: Position;
  size?: Size;
  type?: string;
  minimized?: boolean;
}

/**
 * Service to handle all window position related operations
 */
class WindowPositionService {
  /**
   * Ensures a window is visible within the viewport
   * @param position Current window position
   * @param size Window size
   * @returns Adjusted position to ensure window is visible
   */
  ensureWindowVisibility(position: Position, size: Size): Position {
    // Get viewport dimensions
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1024;
    const viewportHeight =
      typeof window !== "undefined"
        ? window.innerHeight - TASKBAR_HEIGHT
        : 768;

    const minVisibleX = Math.min(
      MIN_VISIBLE_WINDOW_EDGE,
      size.width * 0.2
    );
    const minVisibleY = Math.min(
      MIN_VISIBLE_WINDOW_EDGE,
      size.height * 0.2
    );

    // Adjust X position if needed
    let adjustedX = position.x;
    if (adjustedX < 0) {
      adjustedX = 0;
    } else if (adjustedX + size.width - minVisibleX > viewportWidth) {
      adjustedX = Math.max(0, viewportWidth - size.width + minVisibleX);
    }

    // Adjust Y position if needed
    let adjustedY = position.y;
    if (adjustedY < 0) {
      adjustedY = 0;
    } else if (adjustedY + size.height - minVisibleY > viewportHeight) {
      adjustedY = Math.max(0, viewportHeight - size.height + minVisibleY);
    }

    // Ensure window is not below taskbar
    const BASE_OFFSET_Y = TASKBAR_HEIGHT + 30;
    if (adjustedY < BASE_OFFSET_Y) {
      adjustedY = BASE_OFFSET_Y;
    }

    return { x: adjustedX, y: adjustedY };
  }

  /**
   * Get cascading position for a new window based on existing windows
   * @param existingWindows Array of existing windows
   * @param windowType Type of the new window
   * @returns Position for the new window
   */
  getCascadingPosition(
    existingWindows: Window[],
    windowType: string
  ): Position {
    const baseX = DEFAULT_WINDOW_POSITION.x;
    const baseY = DEFAULT_WINDOW_POSITION.y;
    const offsetX = DEFAULT_CASCADE_OFFSET.X;
    const offsetY = DEFAULT_CASCADE_OFFSET.Y;

    // Count visible windows of the same type to apply cascading effect
    const visibleSameTypeWindows = existingWindows.filter(
      (w) => !w.minimized && w.type === windowType
    );

    const sameTypeCount = visibleSameTypeWindows.length;

    // Apply modulo to prevent excessive offsets for many windows
    const cascadeIndex = sameTypeCount % 10;
    const x = baseX + cascadeIndex * offsetX;
    const y = baseY + cascadeIndex * offsetY;

    // Check if position is valid and adjust if needed
    const defaultSize = this.getDefaultWindowSize(windowType);
    return this.ensureWindowVisibility({ x, y }, defaultSize);
  }

  /**
   * Get position for centered window like dialogs
   * @param size Size of the window to center
   * @returns Centered position for the window
   */
  getCenteredPosition(size: Size): Position {
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1024;
    const viewportHeight =
      typeof window !== "undefined"
        ? window.innerHeight - TASKBAR_HEIGHT
        : 768;

    const x = Math.max(0, (viewportWidth - size.width) / 2);
    const BASE_OFFSET_Y = TASKBAR_HEIGHT + 30;
    const y = Math.max(
      BASE_OFFSET_Y,
      (viewportHeight - size.height) / 2
    );

    return { x, y };
  }

  /**
   * Get default window size based on window type
   * @param windowType Type of window
   * @returns Default size for the window type
   */
  getDefaultWindowSize(windowType: string): Size {
    return (
      WINDOW_SIZES[windowType as keyof typeof WINDOW_SIZES] ||
      WINDOW_SIZES.default
    );
  }

  /**
   * Get position when restoring a window from maximized state
   * @param savedPosition Previously saved position before maximizing
   * @param size Window size
   * @returns Valid position for restored window
   */
  getRestorePosition(savedPosition: Position, size: Size): Position {
    return this.ensureWindowVisibility(savedPosition, size);
  }

  /**
   * Calculate position for a new window, optimized for visibility
   * @param windowType Type of the window
   * @param existingWindows Currently open windows
   * @param preferredPosition Optional preferred position
   * @returns Optimal position for the new window
   */
  calculateWindowPosition(
    windowType: string,
    existingWindows: Window[],
    preferredPosition?: Position
  ): Position {
    // If preferred position provided, ensure it's valid
    if (preferredPosition) {
      const size = this.getDefaultWindowSize(windowType);
      return this.ensureWindowVisibility(preferredPosition, size);
    }

    // Otherwise use cascading position
    return this.getCascadingPosition(existingWindows, windowType);
  }
}

// Create and export a singleton instance
const windowPositionService = new WindowPositionService();
export default windowPositionService;

// Also export individual methods directly from the instance for easier use
export const ensureWindowVisibility =
  windowPositionService.ensureWindowVisibility.bind(windowPositionService);
export const getCascadingPosition =
  windowPositionService.getCascadingPosition.bind(windowPositionService);
export const getCenteredPosition =
  windowPositionService.getCenteredPosition.bind(windowPositionService);
export const getDefaultWindowSize =
  windowPositionService.getDefaultWindowSize.bind(windowPositionService);
export const getRestorePosition = windowPositionService.getRestorePosition.bind(
  windowPositionService
);
export const calculateWindowPosition =
  windowPositionService.calculateWindowPosition.bind(windowPositionService);
