// src/utils/WindowPositionService.ts
import {
  WINDOW_POSITIONS,
  WINDOW_DEFAULT_SIZES,
} from "../constants/windowConstants";


export interface Position{
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
 * Service to handle  all window position related operations
 */
class WindowPositionService {
  /**
   * * Ensures a window is visible within the viewport
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
        ? window.innerHeight - WINDOW_POSITIONS.TASKBAR_HEIGHT
        : 768;

    const minVisibleX = Math.min(
      WINDOW_POSITIONS.MIN_VISIBLE_PART,
      size.width * 0.2
    );
    const minVisibleY = Math.min(
      WINDOW_POSITIONS.MIN_VISIBLE_PART,
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

    if (adjustedY < WINDOW_POSITIONS.BASE_OFFSET_Y) {
      adjustedY = WINDOW_POSITIONS.BASE_OFFSET_Y;
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
    const baseX = WINDOW_POSITIONS.BASE_OFFSET_X;
    const baseY = WINDOW_POSITIONS.BASE_OFFSET_Y;
    const offsetX = WINDOW_POSITIONS.CASCADE_OFFSET_X;
    const offsetY = WINDOW_POSITIONS.CASCADE_OFFSET_Y;

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
        ? window.innerHeight - WINDOW_POSITIONS.TASKBAR_HEIGHT
        : 768;

    const x = Math.max(0, (viewportWidth - size.width) / 2);
    const y = Math.max(
      WINDOW_POSITIONS.BASE_OFFSET_Y,
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
      WINDOW_DEFAULT_SIZES[windowType as keyof typeof WINDOW_DEFAULT_SIZES] ||
      WINDOW_DEFAULT_SIZES.default
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

// Export singleton instance
export const windowPositionService = new WindowPositionService();

// Also export individual methods for easier testing and reuse
export const {
  ensureWindowVisibility,
  getCascadingPosition,
  getCenteredPosition,
  getDefaultWindowSize,
  getRestorePosition,
  calculateWindowPosition,
} = windowPositionService;