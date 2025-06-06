import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WindowPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface WindowState {
    id: string;
    title: string;
    content: React.ReactNode;
    icon?: string;
    isOpen: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    isFocused: boolean;
    position: WindowPosition;
    component: string;
    zIndex: number;
}

interface WindowContextType {
    windows: WindowState[];
    openWindow: (window: Omit<WindowState, 'isOpen' | 'isMinimized' | 'isMaximized' | 'isFocused' | 'zIndex'>) => void;
    closeWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    restoreWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    updateWindowPosition: (id: string, position: Partial<WindowPosition>) => void;
    getHighestZIndex: () => number;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export const useWindow = () => {
    const context = useContext(WindowContext);
    if (!context) {
        throw new Error('useWindow must be used within a WindowProvider');
    }
    return context;
};

export const WindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [highestZIndex, setHighestZIndex] = useState(100);

    // Load window states from localStorage on mount
    useEffect(() => {
        try {
            const savedWindows = localStorage.getItem('win95-windows');
            if (savedWindows) {
                // We can't serialize React nodes, so we need to omit the content property
                // and recreate it based on the component property
                setWindows(JSON.parse(savedWindows));
            }
        } catch (error) {
            console.error('Failed to load windows from localStorage:', error);
        }
    }, []);

    // Save window states to localStorage when they change
    useEffect(() => {
        try {
            // We can't serialize React nodes, so we need to omit the content property
            const windowsToSave = windows.map(({ content, ...rest }) => rest);
            localStorage.setItem('win95-windows', JSON.stringify(windowsToSave));
        } catch (error) {
            console.error('Failed to save windows to localStorage:', error);
        }
    }, [windows]);

    const getHighestZIndex = () => {
        const highest = windows.reduce((max, window) => Math.max(max, window.zIndex), 0);
        return highest + 1;
    };

    const openWindow = (window: Omit<WindowState, 'isOpen' | 'isMinimized' | 'isMaximized' | 'isFocused' | 'zIndex'>) => {
        const newZIndex = highestZIndex + 1;
        setHighestZIndex(newZIndex);

        // Check if window already exists
        const existingWindow = windows.find(w => w.id === window.id);
        if (existingWindow) {
            setWindows(prevWindows =>
                prevWindows.map(w =>
                    w.id === window.id
                        ? { ...w, isOpen: true, isMinimized: false, isFocused: true, zIndex: newZIndex }
                        : { ...w, isFocused: false }
                )
            );
        } else {
            setWindows(prevWindows => [
                ...prevWindows.map(w => ({ ...w, isFocused: false })),
                {
                    ...window,
                    isOpen: true,
                    isMinimized: false,
                    isMaximized: false,
                    isFocused: true,
                    zIndex: newZIndex
                }
            ]);
        }
    };

    const closeWindow = (id: string) => {
        setWindows(prevWindows => prevWindows.filter(window => window.id !== id));
    };

    const minimizeWindow = (id: string) => {
        setWindows(prevWindows =>
            prevWindows.map(window =>
                window.id === id
                    ? { ...window, isMinimized: true, isFocused: false }
                    : window
            )
        );
    };

    const maximizeWindow = (id: string) => {
        const newZIndex = highestZIndex + 1;
        setHighestZIndex(newZIndex);

        setWindows(prevWindows =>
            prevWindows.map(window =>
                window.id === id
                    ? { ...window, isMaximized: !window.isMaximized, isFocused: true, zIndex: newZIndex }
                    : { ...window, isFocused: false }
            )
        );
    };

    const restoreWindow = (id: string) => {
        const newZIndex = highestZIndex + 1;
        setHighestZIndex(newZIndex);

        setWindows(prevWindows =>
            prevWindows.map(window =>
                window.id === id
                    ? { ...window, isMinimized: false, isFocused: true, zIndex: newZIndex }
                    : { ...window, isFocused: false }
            )
        );
    };

    const focusWindow = (id: string) => {
        const newZIndex = highestZIndex + 1;
        setHighestZIndex(newZIndex);

        setWindows(prevWindows =>
            prevWindows.map(window =>
                window.id === id
                    ? { ...window, isFocused: true, zIndex: newZIndex }
                    : { ...window, isFocused: false }
            )
        );
    };

    const updateWindowPosition = (id: string, position: Partial<WindowPosition>) => {
        setWindows(prevWindows =>
            prevWindows.map(window =>
                window.id === id
                    ? { ...window, position: { ...window.position, ...position } }
                    : window
            )
        );
    };

    return (
        <WindowContext.Provider
            value={{
                windows,
                openWindow,
                closeWindow,
                minimizeWindow,
                maximizeWindow,
                restoreWindow,
                focusWindow,
                updateWindowPosition,
                getHighestZIndex
            }}
        >
            {children}
        </WindowContext.Provider>
    );
};