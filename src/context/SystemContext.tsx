import React, { createContext, useContext, useState, useEffect } from 'react';

interface SystemContextType {
    wallpaper: string;
    setWallpaper: (wallpaper: string) => void;
    isStartMenuOpen: boolean;
    toggleStartMenu: () => void;
    closeStartMenu: () => void;
    contextMenuPosition: { x: number; y: number } | null;
    setContextMenuPosition: (position: { x: number; y: number } | null) => void;
    currentTime: string;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const useSystem = () => {
    const context = useContext(SystemContext);
    if (!context) {
        throw new Error('useSystem must be used within a SystemProvider');
    }
    return context;
};

const wallpapers = [
    'win95-teal',
    'win95-clouds',
    'win95-hills',
    'win95-maze',
];

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Try to load wallpaper from localStorage or default to first one
    const [wallpaper, setWallpaper] = useState<string>(() => {
        try {
            const saved = localStorage.getItem('win95-wallpaper');
            return saved || wallpapers[0];
        } catch (error) {
            return wallpapers[0];
        }
    });

    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const [currentTime, setCurrentTime] = useState<string>(formatTime(new Date()));

    // Save wallpaper to localStorage when it changes
    useEffect(() => {
        try {
            localStorage.setItem('win95-wallpaper', wallpaper);
        } catch (error) {
            console.error('Failed to save wallpaper to localStorage:', error);
        }
    }, [wallpaper]);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(formatTime(new Date()));
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    // Close context menu when clicking anywhere
    useEffect(() => {
        const handleClick = () => {
            setContextMenuPosition(null);
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const toggleStartMenu = () => {
        setIsStartMenuOpen(prev => !prev);
    };

    const closeStartMenu = () => {
        setIsStartMenuOpen(false);
    };

    function formatTime(date: Date): string {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    }

    return (
        <SystemContext.Provider
            value={{
                wallpaper,
                setWallpaper,
                isStartMenuOpen,
                toggleStartMenu,
                closeStartMenu,
                contextMenuPosition,
                setContextMenuPosition,
                currentTime
            }}
        >
            {children}
        </SystemContext.Provider>
    );
};