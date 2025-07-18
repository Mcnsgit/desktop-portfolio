// src/components/desktop/Desktop.tsx
import React from "react";
import styles from './Desktop.module.scss';
import Window from "./Window";
import { WindowProps } from "../../types/window";
import { DesktopFile } from "../../types/fs";
import { desktopFiles } from "../../config/data";
import Taskbar from "./Taskbar";
import Icon from "./Icon";

interface DesktopProps {
    windows: WindowProps[];
    desktopFiles: DesktopFile[];
    onOpenWindow: (file: DesktopFile) => void;
    onCloseWindow: (id: string) => void;
    onUpdateWindowState: (id: string, newProps: Partial<WindowProps>) => void;
    onSetActiveWindow: (id: string) => void;
    onTaskbarItemClick: (id: string) => void;
    onIconPositionChange: (id: string, x: number, y: number) => void;
    background?: string;
}
const Desktop: React.FC<DesktopProps> = ({
    windows,
    desktopFiles,
    onOpenWindow,
    onCloseWindow,
    onUpdateWindowState,
    onSetActiveWindow,
    onTaskbarItemClick,
    onIconPositionChange,
    background
}) => {

    // const openWindow = (file: DesktopFile) => {
    //     const existingWindow = windows.find(win => win.id === file.id);
    //     if (existingWindow) {
    //         setActiveWindow(file.id);
    //         if (existingWindow.isMinimized) {
    //             updateWindowState(file.id, { isMinimized: false });
    //         }
    //         return;
    //     }

    //     const newWindow: WindowProps = {
    //         id: file.id || uuidv4(),
    //         title: file.name,
    //         icon: file.icon,
    //         content: generateWindowContent(file),
    //         x: 100,
    //         y: 100,
    //         w: 640,
    //         h: 480,
    //         isMinimized: false,
    //         isMaximized: false,
    //         isActive: true,
    //     };

    //     setWindows(prevWindows => [...prevWindows.map(w => ({ ...w, isActive: false })), newWindow]);
    // };

    // const closeWindow = (id: string) => {
    //     setWindows(windows.filter(win => win.id !== id));
    // };

    // const updateWindowState = (id: string, newProps: Partial<WindowProps>) => {
    //     setWindows(prevWindows =>
    //         prevWindows.map(win => (win.id === id ? { ...win, ...newProps } : win))
    //     );
    // };

    // const setActiveWindow = useCallback((id: string) => {
    //     setWindows(prevWindows =>
    //         prevWindows.map(win => ({
    //             ...win,
    //             isActive: win.id === id,
    //         }))
    //     );
    // }, []);

    return (
        <div
            className={styles.desktop}
            style={{ backgroundImage: background ? `url(${background})` : 'none' }}
        >
            {desktopFiles.map(file => (
                <Icon
                    key={file.id}
                    id={file.id}
                    iconSrc={file.icon}
                    text={file.name}
                    onDoubleClick={() => onOpenWindow(file)}
                    onPositionChange={onIconPositionChange}
                    x={file.x}
                    y={file.y}
                />
            ))}

            {windows.map(win => (
                <Window
                    key={win.id}
                    {...win}
                    onClose={() => onCloseWindow(win.id)}
                    onMinimize={() => onUpdateWindowState(win.id, { isMinimized: true, isActive: false })}
                    onMaximize={() => onUpdateWindowState(win.id, { isMaximized: !win.isMaximized })}
                    onFocus={() => onSetActiveWindow(win.id)}
                    onDragStop={(x, y) => onUpdateWindowState(win.id, { x, y })}
                />
            ))}

            <Taskbar
                openWindows={windows}
                onTaskbarItemClick={onTaskbarItemClick}
            />
        </div>
    );
};

export default Desktop;