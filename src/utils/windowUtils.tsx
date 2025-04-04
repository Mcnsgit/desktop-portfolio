// utils/windowUtils.js
// This file provides utility functions for window positioning and handling

/**
 * Get a default window position that ensures visibility
 * @param {number} index - Optional index to offset multiple windows
 * @returns {Object} The position {x, y}
 */
export const getDefaultWindowPosition = (index = 0) => {
    // Base position with cascading effect for multiple windows
    return {
        x: 60 + (index * 20),
        y: 60 + (index * 20)  // Start higher on the screen to avoid taskbar
    };
};

/**
 * Get default window dimensions based on window type
 * @param {string} windowType - The type of window
 * @returns {Object} The size {width, height}
 */
interface WindowSize {
    width: number;
    height: number;
}

export const getDefaultWindowSize = (windowType: string): WindowSize => {
    switch (windowType) {
        case 'fileexplorer':
            return { width: 600, height: 450 };
        case 'texteditor':
            return { width: 550, height: 400 };
        case 'imageviewer':
            return { width: 500, height: 450 };
        case 'about':
            return { width: 480, height: 400 };
        case 'project':
            return { width: 600, height: 500 };
        case 'contact':
            return { width: 500, height: 400 };
        case 'skills':
            return { width: 550, height: 450 };
        default:
            return { width: 500, height: 400 };
    }
};

/**
 * Adjusts a window's position to ensure it's always visible within the viewport
 * @param {Object} position - The current position {x, y}
 * @param {Object} size - The window size {width, height}
 * @returns {Object} The adjusted position {x, y}
 */
interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

export const ensureWindowVisibility = (position: Position, size: Size): Position => {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 40; // Account for taskbar

    // Ensure minimum visibility (at least 100px or 20% of window size)
    const minVisibleX = Math.min(100, size.width * 0.2);
    const minVisibleY = Math.min(100, size.height * 0.2);

    // Adjust X position if needed
    let adjustedX = position.x;
    if (adjustedX < 0) {
        adjustedX = 0;
    } else if (adjustedX + size.width - minVisibleX > viewportWidth) {
        adjustedX = viewportWidth - size.width + minVisibleX;
    }

    // Adjust Y position if needed
    let adjustedY = position.y;
    if (adjustedY < 0) {
        adjustedY = 0;
    } else if (adjustedY + size.height - minVisibleY > viewportHeight) {
        adjustedY = viewportHeight - size.height + minVisibleY;
    }

    return { x: adjustedX, y: adjustedY };
};

/**
 * Apply cascading effect for opening multiple windows
 * @param {Array} existingWindows - Array of existing windows
 * @param {string} newWindowId - ID of the new window
 * @returns {Object} The position {x, y}
 */
interface Window {
    id: string;
}

export const getCascadingPosition = (existingWindows: Window[], newWindowId: string): Position => {
    const baseX = 60;
    const baseY = 60;
    const offsetX = 20;
    const offsetY = 20;

    // Count windows of the same type to apply cascading effect
    const windowType = newWindowId.split('-')[0];
    const sameTypeCount = existingWindows.filter((w: Window) =>
        w.id.startsWith(windowType)
    ).length;

    return {
        x: baseX + (sameTypeCount * offsetX),
        y: baseY + (sameTypeCount * offsetY)
    };
};