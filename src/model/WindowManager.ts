import { WindowModel } from './Window';

export class WindowManager {
    private windows: WindowModel[] = [];
    private focusedWindowId: string | null = null;

    constructor() {}

    openWindow(window: WindowModel): void {
        window.open();
        this.windows.push(window);
        this.setFocus(window.id);
    }

    closeWindow(windowId: string): void {
        const window = this.findWindowById(windowId);
        if (window) {
            window.close();
            this.windows = this.windows.filter(w => w.id !== windowId);
            if (this.focusedWindowId === windowId) {
                this.focusedWindowId = null;
                const lastOpenWindow = this.windows.find(w => w.isOpen && !w.isMinimized);
                if (lastOpenWindow) {
                    this.setFocus(lastOpenWindow.id);
                }
            }
        }
    }

    minimizeWindow(windowId: string): void {
        const window = this.findWindowById(windowId);
        if (window) {
            window.minimize();
            if (this.focusedWindowId === windowId) {
                this.focusedWindowId = null;
                const lastOpenWindow = this.windows.find(w => w.isOpen && !w.isMinimized);
                if (lastOpenWindow) {
                    this.setFocus(lastOpenWindow.id);
                }
            }
        }
    }
    
    restoreWindow(windowId: string): void {
        const window = this.findWindowById(windowId);
        if (window && window.isMinimized) {
            window.restore();
            this.setFocus(windowId);
        }
    }

    setFocus(windowId: string): void {
        const targetWindow = this.findWindowById(windowId);
        if (!targetWindow || !targetWindow.isOpen || targetWindow.isMinimized) {
            if (this.focusedWindowId && targetWindow?.id === this.focusedWindowId) {
                const currentFocused = this.findWindowById(this.focusedWindowId);
                currentFocused?.unfocus();
                this.focusedWindowId = null;
            }
            return;
        }

        if (this.focusedWindowId === windowId) return;

        if (this.focusedWindowId) {
            const oldFocusedWindow = this.findWindowById(this.focusedWindowId);
            oldFocusedWindow?.unfocus();
        }

        targetWindow.focus();
        this.focusedWindowId = windowId;
        
        this.windows = this.windows.filter(w => w.id !== windowId);
        this.windows.push(targetWindow);
    }

    findWindowById(windowId: string): WindowModel | undefined {
        return this.windows.find(w => w.id === windowId);
    }

    getOpenWindows(): WindowModel[] {
        return this.windows.filter(w => w.isOpen);
    }

    getFocusedWindow(): WindowModel | undefined {
        return this.focusedWindowId ? this.findWindowById(this.focusedWindowId) : undefined;
    }

    renderAll(): string {
        let output = "\n--- Open Windows ---";
        const openWindows = this.getOpenWindows();
        if (openWindows.length === 0) {
            output += "\n(No windows open)";
        } else {
            openWindows.forEach(w => {
                if (w.id !== this.focusedWindowId) output += w.render();
            });
            const focused = this.getFocusedWindow();
            if (focused) output += focused.render();
        }
        output += "\n--- End Open Windows ---";
        return output;
    }

    // New method to get windows array for UI rendering
    getWindowsForUI(): WindowModel[] {
        return this.windows;
    }

    updateWindowTitle(windowId: string, newTitle: string): void {
        const window = this.findWindowById(windowId);
        if (window) {
            window.title = newTitle;
            // console.log(`[WindowManager] Window title updated for ${windowId} to "${newTitle}"`);
            // UI update will be handled by the component observing the window model.
        } else {
            console.warn(`[WindowManager] updateWindowTitle: Window with ID ${windowId} not found.`);
        }
    }
} 