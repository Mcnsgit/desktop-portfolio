// src/components/desktop/Desktop.tsx
import React, { useState, useCallback } from "react";
import styles from './Desktop.module.scss';
import Window from "./Window";
import { WindowProps } from "../../types/window";
import { DesktopFile } from "../../types/fs";
import { desktopFiles } from "../../config/data";
import Taskbar from "./Taskbar";
import Icon from "./Icon";
import generateWindowContent from "@/utils/windowContentGenerator";
import { v4 as uuidv4 } from 'uuid';

const Desktop = () => {
    const [windows, setWindows] = useState<WindowProps[]>([]);

    const openWindow = (file: DesktopFile) => {
        const existingWindow = windows.find(win => win.id === file.id);
        if (existingWindow) {
            setActiveWindow(file.id);
            if (existingWindow.isMinimized) {
                updateWindowState(file.id, { isMinimized: false });
            }
            return;
        }

        const newWindow: WindowProps = {
            id: file.id || uuidv4(),
            title: file.name,
            icon: file.icon,
            content: generateWindowContent(file),
            x: 100,
            y: 100,
            w: 640,
            h: 480,
            isMinimized: false,
            isMaximized: false,
            isActive: true,
        };

        setWindows(prevWindows => [...prevWindows.map(w => ({ ...w, isActive: false })), newWindow]);
    };

    const closeWindow = (id: string) => {
        setWindows(windows.filter(win => win.id !== id));
    };

    const updateWindowState = (id: string, newProps: Partial<WindowProps>) => {
        setWindows(prevWindows =>
            prevWindows.map(win => (win.id === id ? { ...win, ...newProps } : win))
        );
    };

    const setActiveWindow = useCallback((id: string) => {
        setWindows(prevWindows =>
            prevWindows.map(win => ({
                ...win,
                isActive: win.id === id,
            }))
        );
    }, []);

    return (
        <div className={styles.desktop}>
            {desktopFiles.map(file => (
                <Icon
                    key={file.id}
                    iconSrc={file.icon}
                    text={file.name}
                    onDoubleClick={() => openWindow(file)}
                />
            ))}

            {windows.map(win => (
                <Window
                    key={win.id}
                    {...win}
                    onClose={() => closeWindow(win.id)}
                    onMinimize={() => updateWindowState(win.id, { isMinimized: true, isActive: false })}
                    onMaximize={() => updateWindowState(win.id, { isMaximized: !win.isMaximized })}
                    onFocus={() => setActiveWindow(win.id)}
                    onDragStop={(x, y) => updateWindowState(win.id, { x, y })}
                />
            ))}

            <Taskbar
                openWindows={windows}
                onTaskbarItemClick={(id) => {
                    const windowToFocus = windows.find(win => win.id === id);
                    if (windowToFocus?.isMinimized) {
                        updateWindowState(id, { isMinimized: false });
                    }
                    setActiveWindow(id);
                }}
            />
        </div>
    );
};

export default Desktop; 