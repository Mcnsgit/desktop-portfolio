import React, { useState, useEffect, useMemo, useCallback, useRef, DragEvent } from "react"; // Added DragEvent
import { useDesktop } from "../../context/DesktopContext";
import Icon from "./Icon";
import FolderComponent from "./Folder"; // Renamed import
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import WindowManager from "../windows/WindowManager";
import RightClickMenu from "./RigthClickMenu"; // Corrected import name
import { useSounds } from "../../hooks/useSounds";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import styles from "../styles/Desktop.module.scss";
import { v4 as uuidv4 } from "uuid";
// *** FIX: Import specific types needed ***
import { DesktopItem, Folder as FolderType, Window as WindowType, Project, Window } from "../../types"; // Ensure Window type is imported

const backgrounds = [
  "/backgrounds/retro_background_1.jpeg",
  "/backgrounds/retro_background_2.jpeg",
  "/backgrounds/retro_background_3.jpeg",
];


// Debug function to check window state
interface WindowState {
  id: string;
  title: string;
  minimized: boolean;
  position: { x: number; y: number };
  type: string;
}

interface WindowStateForDebug extends Omit<WindowType, 'content'> { // Use WindowType alias for consistency
  type: string; // Ensure type is string for logging
}
const debugWindowState = (windowsState: WindowType[], activeWindowId: string | null): void => {
  console.log("Current window state:", {
    totalWindows: windowsState.length,
    openWindows: windowsState.filter((w) => !w).length,
    minimizedWindows: windowsState.filter((w) => w).length,
    activeWindow: windowsState.find((w) => w.id === activeWindowId)?.id || "none",
    windowDetails: windowsState.map((w) => ({
      id: w.id,
      title: w.title,
      minimized: w.minimized,
      position: w.position,
      type: w.type || "unknown",
      zIndex: w.zIndex,
      size: w.size,
    })),
  });
};
interface CommonProps {
  key: string;
  itemId: string;
  label: string;
  icon: string;
  onDoubleClick: () => void;
}

// Interface for FolderComponent props (assuming its definition)
interface FolderProps extends CommonProps {
  id: string; // Expects 'id' prop specifically
  title: string; // Expects 'title' prop specifically
  // Add any other props FolderComponent needs, e.g., onDrop
  onDrop?: (e: DragEvent, folderId: string) => void;
}


const Desktop: React.FC = function Desktop() {
  const { state, dispatch } = useDesktop(); // Get state and dispatch
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const { playSound } = useSounds();
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; position: { x: number; y: number }; }>({ visible: false, position: { x: 0, y: 0 } });

  useKeyboardShortcuts();

  // --- Drag and Drop Handlers ---
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("application/retroos-icon-id");
    const desktopRect = desktopContainerRef.current?.getBoundingClientRect();
    if (itemId && desktopRect) {
      let x = e.clientX - desktopRect.left;
      let y = e.clientY - desktopRect.top;
      const iconWidth = 80, iconHeight = 90, padding = 10;
      const taskbarHeight = 30; // Ideally from constants

      x = x - iconWidth / 2; // Center horizontally
      y = y - iconHeight / 2; // Center vertically

      // Constrain position
      x = Math.max(padding, Math.min(x, desktopRect.width - iconWidth - padding));
      // Use desktopRect.height as it's already excluding taskbar space due to container styling
      y = Math.max(padding, Math.min(y, desktopRect.height - iconHeight - padding));

      dispatch({
        type: "UPDATE_ITEM_POSITION",
        payload: { itemId: itemId, position: { x: Math.round(x), y: Math.round(y) } },
      });
    }
  }, [dispatch]);
  // --- End D&D Handlers ---

  // --- Double Click Handler ---
  const handleIconDoubleClick = useCallback((itemId: string) => {
    console.log(`Double-clicked on item ID: ${itemId}`);
    const item = state.desktopItems.find((i: DesktopItem) => i.id === itemId);

    if (!item) {
      console.error(`Item not found: ${itemId}`);
      return;
    }

    playSound("windowOpen"); // Consider using WINDOW_SOUNDS.WINDOW_OPEN

    let windowPayload: WindowType | null = null; // Use WindowType alias
    const basePosition = { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 };

    if (item.type === "project") {
      const project = state.projects.find((p: Project) => p.id === itemId); // Add type Project
      if (project) {
        windowPayload = {
          id: `project-${project.id}`, title: project.title, type: "project",
          content: { type: "project", projectId: project.id },
          minimized: false, position: basePosition,
          size: { width: 600, height: 500 }, zIndex: 1, // zIndex managed by reducer
        };
      }
    } else if (item.type === "folder") {
      const folder = state.folders.find((f: FolderType) => f.id === itemId); // Add type FolderType
      if (folder) {
        windowPayload = {
          id: `folder-${folder.id}`, title: folder.title, type: "folder",
          content: { type: "folder", folderId: folder.id },
          minimized: false, position: basePosition,
          size: { width: 550, height: 400 }, zIndex: 1,
        };
      }
    } else if (item.type === "shortcut") {
      // Placeholder: Implement shortcut handling logic
      // e.g., read target, then potentially dispatch OPEN_WINDOW for an app or folder
      console.log("Shortcut double-clicked:", item.title);
      // Example: if (target === 'app:texteditor') openTextEditor(dispatch);
      // Example: if (target === '/projects') openFileExplorer(dispatch, '/projects');
      return; // Exit if shortcut handling is implemented elsewhere or pending
    }

    if (windowPayload) {
      console.log("Dispatching OPEN_WINDOW:", windowPayload);
      dispatch({ type: "OPEN_WINDOW", payload: windowPayload });
      // Focus after a short delay
      setTimeout(() => {
        dispatch({ type: "FOCUS_WINDOW", payload: { id: windowPayload!.id } }) // Use non-null assertion if payload is guaranteed
      }, 100);
    } else {
      console.error(`Could not find data for ${item.type} with id: ${itemId}`);
    }
  }, [dispatch, playSound, state.projects, state.folders, state.desktopItems]);
  // --- End Double Click ---


  // --- Other Handlers ---
  const handleDesktopClick = useCallback(() => {
    if (state.startMenuOpen) dispatch({ type: "TOGGLE_START_MENU", payload: { startMenuOpen: false } });
    if (contextMenu.visible) setContextMenu((prev) => ({ ...prev, visible: false }));
  }, [state.startMenuOpen, contextMenu.visible, dispatch]);

  const cycleBackground = useCallback(() => {
    setBackgroundIndex(prev => (prev + 1) % backgrounds.length);
    playSound("click");
  }, [playSound]);

  const handleStartClick = useCallback(() => {
    dispatch({ type: "TOGGLE_START_MENU" });
    playSound("click"); // Play sound on start click too
  }, [dispatch, playSound]);

  const handleRightClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    playSound("click");
    setContextMenu({ visible: true, position: { x: e.clientX, y: e.clientY } });
  }, [playSound]);
  // --- End Other Handlers ---
     // Context Menu Items
    const contextMenuItems = useMemo(() => [
        { label: "Change Background", action: cycleBackground },
        {
            label: "New Folder", action: () => {
                const folderId = uuidv4();
                const containerRect = desktopContainerRef.current?.getBoundingClientRect();
                const newPosition = {
                    x: Math.max(10, contextMenu.position.x - (containerRect?.left || 0) - 40),
                    y: Math.max(10, contextMenu.position.y - (containerRect?.top || 0) - 45),
                };
                const payload: FolderType = {
                    id: folderId, title: "New Folder", icon: "/assets/win98-icons/png/directory_closed-1.png",
                    items: [], position: newPosition, parentId: null,
                };
                dispatch({ type: "CREATE_FOLDER", payload });
                setContextMenu(prev => ({ ...prev, visible: false }));
            }
        },
        { label: "Refresh", action: () => window.location.reload() },
    ], [cycleBackground, contextMenu.position, dispatch]);

    // Filtered Desktop Items
    const desktopItems = useMemo(() => state.desktopItems.filter(item => !item.parentId), [state.desktopItems]);

    // Render Start Menu Callback
    const renderStartMenu = useCallback(() => state.startMenuOpen ? <StartMenu /> : null, [state.startMenuOpen]);

    // Effect for Debugging Window State
    useEffect(() => {
        debugWindowState(state.windows, state.activeWindowId);
    }, [state.windows, state.activeWindowId]);

    // --- Render ---
    return (
        <div
            ref={desktopContainerRef}
            className={styles.desktop}
            style={{ backgroundImage: `url(${backgrounds[backgroundIndex]})`, backgroundSize: "cover", backgroundPosition: "center" }}
            onClick={handleDesktopClick}
            onContextMenu={handleRightClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className={styles.iconsContainer}>
                {desktopItems.map((item) => {
                    // Define common props inside the loop scope
                    const commonProps: CommonProps = {
                        key: item.id, // Use key directly here
                        itemId: item.id,
                        label: item.title,
                        icon: item.icon || '',
                        onDoubleClick: () => handleIconDoubleClick(item.id),
                    };
                    return (
                        <div
                            key={`wrapper-${item.id}`} // Use a unique key for the wrapper
                            style={{
                                position: 'absolute', left: `${item.position.x}px`, top: `${item.position.y}px`,
                                width: '80px', height: '90px', zIndex: item.zIndex || 1
                            }}
                            data-testid={`desktop-item-${item.id}`}
                        >
                            {item.type === 'folder' ? (
                                // Pass specific required props for FolderComponent
                                <FolderComponent
                                    {...commonProps} // Spread common props
                                    id={item.id}       // Pass id explicitly
                                    title={item.title}   // Pass title explicitly
                                    position={item.position} // Pass position explicitly
                                />
                            ) : (
                                // Icon component doesn't need position prop
                                <Icon {...commonProps} />
                            )}
                        </div>
                    );
                })}
            </div>

            <WindowManager />
            {renderStartMenu()}
            {contextMenu.visible && (
                <RightClickMenu
                    position={contextMenu.position}
                    items={contextMenuItems}
                    // *** FIX: Replace placeholder with actual close handler ***
                    onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
                />
            )}
            <Taskbar onStartClick={handleStartClick} />
        </div>
    );
};

export default Desktop;