// src/components/desktop/Desktop.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDesktop } from "../../context/DesktopContext";
import { useSounds } from "../../hooks/useSounds";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import Icon from "./Icon";
import Folder from "./Folder";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import WindowManager from "../windows/WindowManager";
import ContextMenu from "./ContextMenu";
import styles from "../styles/Desktop.module.scss";
import { v4 as uuidv4 } from "uuid";
import { DesktopItem } from "../../types";

// Backgrounds can be customized
const backgrounds = [
  "/backgrounds/retro_background_1.jpeg",
  "/backgrounds/retro_background_2.jpeg",
  "/backgrounds/retro_background_3.jpeg",
];

const Desktop: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const { playSound } = useSounds();
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    targetId?: string;
    targetType?: string;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
  });

  // New state for selection handling
  const [selectionBox, setSelectionBox] = useState<{
    active: boolean;
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Calculate desktop area
  const getDesktopRect = useCallback(() => {
    return desktopContainerRef.current?.getBoundingClientRect() || {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight - 30, // Adjust for taskbar
    };
  }, []);

  // Drag and drop handlers for desktop items
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("application/retroos-icon-id");

    if (!itemId) return;

    const desktopRect = getDesktopRect();

    let x = e.clientX - desktopRect.left;
    let y = e.clientY - desktopRect.top;

    // Adjust position to center the icon at drop point
    const iconWidth = 80, iconHeight = 90;
    x = Math.max(10, Math.min(x - iconWidth / 2, desktopRect.width - iconWidth - 10));
    y = Math.max(10, Math.min(y - iconHeight / 2, desktopRect.height - iconHeight - 10));

    // Update item position
    dispatch({
      type: "UPDATE_ITEM_POSITION",
      payload: {
        itemId: itemId,
        position: {
          x: Math.round(x),
          y: Math.round(y)
        }
      },
    });

    // Play sound for successful drop
    playSound("click");
  }, [dispatch, getDesktopRect, playSound]);

  // Handle icon double-click to open windows
  const handleIconDoubleClick = useCallback((itemId: string) => {
    const item = state.desktopItems.find((i: DesktopItem) => i.id === itemId);

    if (!item) {
      console.error(`Item not found: ${itemId}`);
      return;
    }

    playSound("windowOpen");

    let windowPayload: any = null;
    const basePosition = {
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50
    };

    if (item.type === "project") {
      const project = state.projects.find((p) => p.id === itemId);
      if (project) {
        windowPayload = {
          id: `project-${project.id}`,
          title: project.title,
          type: "project",
          content: { type: "project", projectId: project.id },
          minimized: false,
          position: basePosition,
          size: { width: 600, height: 500 },
          zIndex: 1,
        };
      }
    } else if (item.type === "folder") {
      const folder = state.folders.find((f) => f.id === itemId);
      if (folder) {
        windowPayload = {
          id: `folder-${folder.id}`,
          title: folder.title,
          type: "folder",
          content: { type: "folder", folderId: folder.id },
          minimized: false,
          position: basePosition,
          size: { width: 550, height: 400 },
          zIndex: 1,
        };
      }
    } else if (item.type === "shortcut") {
      // Handle shortcut by its target
      const targetType = item.icon?.includes('directory') ? 'folder' : 'file';

      if (targetType === 'folder') {
        windowPayload = {
          id: `folder-shortcut-${item.id}`,
          title: item.title,
          type: "folder",
          content: { type: "folder", folderId: item.parentId || "root" },
          minimized: false,
          position: basePosition,
          size: { width: 550, height: 400 },
          zIndex: 1,
        };
      } else {
        // Assume it's a file or app shortcut
        // Implementation depends on your shortcut system
        console.log("Opening shortcut:", item.title);
      }
    }

    if (windowPayload) {
      console.log("Opening window:", windowPayload);
      dispatch({ type: "OPEN_WINDOW", payload: windowPayload });

      // Focus the window
      setTimeout(() => {
        dispatch({ type: "FOCUS_WINDOW", payload: { id: windowPayload.id } });
      }, 100);
    }
  }, [dispatch, playSound, state.desktopItems, state.folders, state.projects]);

  // Desktop click handlers
  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    // Close start menu if open
    if (state.startMenuOpen) {
      dispatch({ type: "TOGGLE_START_MENU", payload: { startMenuOpen: false } });
    }

    // Close context menu if open
    if (contextMenu.visible) {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }

    // Clear selection if not dragging and not holding Ctrl
    if (!e.ctrlKey && !selectionBox?.active) {
      setSelectedItems(new Set());
    }
  }, [state.startMenuOpen, contextMenu.visible, dispatch, selectionBox]);

  // Handle right-click for context menu
  const handleDesktopRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    playSound("click");

    // Get target element
    const target = e.target as HTMLElement;
    const desktopItem = target.closest('[data-item-id]');
    let targetId, targetType;

    if (desktopItem) {
      targetId = desktopItem.getAttribute('data-item-id');
      targetType = desktopItem.getAttribute('data-item-type') || 'file';
    } else {
      targetType = 'desktop';
    }

    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
      targetId: targetId ?? undefined,
      targetType,
    });
  }, [playSound]);

  // Handle context menu actions
  const handleContextMenuClose = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Cycle desktop background
  const cycleBackground = useCallback(() => {
    setBackgroundIndex(prev => (prev + 1) % backgrounds.length);
    playSound("click");
  }, [playSound]);

  // Start menu toggle
  const handleStartClick = useCallback(() => {
    dispatch({ type: "TOGGLE_START_MENU" });
    playSound("click");
  }, [dispatch, playSound]);

  // Selection box handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start selection box on left-click directly on desktop
    if (e.button !== 0 || e.target !== desktopContainerRef.current) return;

    const desktopRect = getDesktopRect();
    const startX = e.clientX - desktopRect.left;
    const startY = e.clientY - desktopRect.top;

    isMouseDown.current = true;

    setSelectionBox({
      active: true,
      start: { x: startX, y: startY },
      end: { x: startX, y: startY },
    });

    // Clear selection if not holding Ctrl key
    if (!e.ctrlKey) {
      setSelectedItems(new Set());
    }
  }, [getDesktopRect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isMouseDown.current || !selectionBox) return;

    const desktopRect = getDesktopRect();
    const endX = e.clientX - desktopRect.left;
    const endY = e.clientY - desktopRect.top;

    setSelectionBox(prev => prev ? {
      ...prev,
      active: true,
      end: { x: endX, y: endY },
    } : null);

    // Update selection based on items in selection box
    const selectionRect = getSelectionRect(selectionBox.start, { x: endX, y: endY });

    // Check which items are within selection
    const newSelectedItems = new Set(e.ctrlKey ? Array.from(selectedItems) : []);

    state.desktopItems.forEach(item => {
      const itemRect = {
        left: item.position.x,
        top: item.position.y,
        right: item.position.x + 80, // Icon width
        bottom: item.position.y + 90, // Icon height
      };

      if (doRectsIntersect(selectionRect, itemRect)) {
        newSelectedItems.add(item.id);
      }
    });

    setSelectedItems(newSelectedItems);
  }, [getDesktopRect, selectionBox, selectedItems, state.desktopItems]);

  const handleMouseUp = useCallback(() => {
    isMouseDown.current = false;
    setSelectionBox(null);
  }, []);

  // Helper to get selection rectangle
  const getSelectionRect = (start: { x: number, y: number }, end: { x: number, y: number }) => {
    return {
      left: Math.min(start.x, end.x),
      top: Math.min(start.y, end.y),
      right: Math.max(start.x, end.x),
      bottom: Math.max(start.y, end.y),
    };
  };

  // Helper to check if rectangles intersect
  const doRectsIntersect = (
    rect1: { left: number, top: number, right: number, bottom: number },
    rect2: { left: number, top: number, right: number, bottom: number }
  ) => {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  };

  // Context menu items
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

        dispatch({
          type: "CREATE_FOLDER",
          payload: {
            id: folderId,
            title: "New Folder",
            icon: "/assets/win98-icons/png/directory_closed-1.png",
            items: [],
            position: newPosition,
            parentId: null,
          }
        });

        setContextMenu(prev => ({ ...prev, visible: false }));
        playSound("click");
      }
    },
    { label: "Refresh", action: () => window.location.reload() },
  ], [cycleBackground, contextMenu.position, dispatch, playSound]);

  // Get desktop items (not inside folders)
  const desktopItems = useMemo(() =>
    state.desktopItems.filter(item => !item.parentId),
    [state.desktopItems]
  );

  // Keyboard shortcuts for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Select all items with Ctrl+A
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const allIds = new Set(state.desktopItems.map(item => item.id));
        setSelectedItems(allIds);
      }

      // Delete selected items with Delete key
      if (e.key === 'Delete' && selectedItems.size > 0) {
        e.preventDefault();
        selectedItems.forEach(id => {
          dispatch({
            type: "DELETE_ITEM",
            payload: { id },
          });
        });
        setSelectedItems(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, selectedItems, state.desktopItems]);

  return (
    <div
      ref={desktopContainerRef}
      className={styles.desktop}
      style={{
        backgroundImage: `url(${backgrounds[backgroundIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopRightClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Desktop icons */}
      <div className={styles.iconsContainer}>
        {desktopItems.map((item) => {
          // Define common props
          const isItemSelected = selectedItems.has(item.id);

          return (
            <div
              key={`wrapper-${item.id}`}
              style={{
                position: 'absolute',
                left: `${item.position.x}px`,
                top: `${item.position.y}px`,
                width: '80px',
                height: '90px',
                zIndex: item.zIndex || 1,
                outline: isItemSelected ? '1px dashed white' : 'none',
                backgroundColor: isItemSelected ? 'rgba(0, 120, 215, 0.3)' : 'transparent',
              }}
              data-item-id={item.id}
              data-item-type={item.type}
              data-testid={`desktop-item-${item.id}`}
            >
              {item.type === 'folder' ? (
                <Folder
                  id={item.id}
                  title={item.title}
                  position={{ x: 0, y: 0 }} // Position is handled by wrapper
                  icon={item.icon}
                  onDoubleClick={() => handleIconDoubleClick(item.id)}
                />
              ) : (
                <Icon
                  icon={item.icon || ''}
                  label={item.title}
                  itemId={item.id}
                  onDoubleClick={() => handleIconDoubleClick(item.id)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Selection box */}
      {selectionBox?.active && (
        <div
          className={styles.selectionBox}
          style={{
            left: `${Math.min(selectionBox.start.x, selectionBox.end.x)}px`,
            top: `${Math.min(selectionBox.start.y, selectionBox.end.y)}px`,
            width: `${Math.abs(selectionBox.end.x - selectionBox.start.x)}px`,
            height: `${Math.abs(selectionBox.end.y - selectionBox.start.y)}px`,
          }}
        />
      )}

      {/* Windows */}
      <WindowManager />

      {/* Start menu */}
      {state.startMenuOpen && <StartMenu />}

      {/* Context menu */}
      {contextMenu.visible && (
        <ContextMenu
          position={contextMenu.position}
          targetId={contextMenu.targetId}
          targetType={contextMenu.targetType}
          onClose={handleContextMenuClose}
        />
      )}

      {/* Taskbar */}
      <Taskbar onStartClick={handleStartClick} />
    </div>
  );
};

export default Desktop;