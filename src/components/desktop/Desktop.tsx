// src/components/desktop/Desktop.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import { useDesktop } from "../../context/DesktopContext";
import { useSounds } from "../../hooks/useSounds";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import Icon from "./Icon";
import Folder from "./Folder";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import WindowManager from "../windows/WindowManager";
import ContextMenu from "./ContextMenu";
import styles from "./Desktop.module.scss";
import { v4 as uuidv4 } from "uuid";
import { DesktopItem, Window, Project } from "../../types";
import { useFileSystem } from "../../context/FileSystemContext";
import { 
  launchApplication,
  launchProject,
  launchFileExplorer,
  launchTodoList,
  launchWeatherApp,
  launchBrowser,
  openFileWithAppropriateApp,
  AppLauncherConfig
} from "../../utils/appLauncher";
import { openFolder } from "../../utils/windowServices/fileHandlers";
import { DESKTOP_ICON_WIDTH, DESKTOP_ICON_HEIGHT, TASKBAR_HEIGHT } from "../../utils/constants";

// Backgrounds can be customized
const backgrounds = [
  "/backgrounds/retro_background_1.jpeg",
  "/backgrounds/retro_background_2.jpeg",
  "/backgrounds/retro_background_3.jpeg",
];

const Desktop: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const fileSystem = useFileSystem();
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
  const lastSelectedItemRef = useRef<string | null>(null); // For Shift-click range selection

  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const { setNodeRef: setDesktopDroppableRef, isOver: isOverDesktop } = useDroppable({
    id: 'desktop-droppable-area',
  });

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Moved getDesktopRect earlier as it's used in handleDragEnd dependencies
  const getDesktopRect = useCallback(() => {
    // Use desktopContainerRef for dimensions if available, otherwise fallback to window dimensions
    const desktopEl = desktopContainerRef.current;
    if (desktopEl) {
      const rect = desktopEl.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height, // This height is the actual droppable area height
      };
    }
    // Fallback if ref not available (should ideally not happen after mount)
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight - TASKBAR_HEIGHT, 
    };
  }, []); 

  // Helper function to snap coordinates to the grid - MOVED & WRAPPED IN useCallback
  const snapToGrid = useCallback((x: number, y: number, rectDimensions: { width: number; height: number; }) => {
    const gridCellWidth = DESKTOP_ICON_WIDTH;
    const gridCellHeight = DESKTOP_ICON_HEIGHT;
    const gridGap = 8; 
    const padding = 16; 

    const effectiveX = x - padding;
    const effectiveY = y - padding;

    const col = Math.floor(effectiveX / (gridCellWidth + gridGap));
    const row = Math.floor(effectiveY / (gridCellHeight + gridGap));

    let snappedX = padding + col * (gridCellWidth + gridGap);
    let snappedY = padding + row * (gridCellHeight + gridGap);
    
    const maxX = rectDimensions.width - DESKTOP_ICON_WIDTH - padding;
    const maxY = rectDimensions.height - DESKTOP_ICON_HEIGHT - padding;

    snappedX = Math.max(padding, Math.min(snappedX, maxX));
    snappedY = Math.max(padding, Math.min(snappedY, maxY));
    
    return { x: Math.round(snappedX), y: Math.round(snappedY) };
  }, []); // Dependencies: DESKTOP_ICON_WIDTH, DESKTOP_ICON_HEIGHT - these are constants, so empty array is fine.

  // --- dnd-kit setup ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // activationConstraint can be omitted for default behavior or configured:
      // activationConstraint: {
      //   delay: 100, 
      //   tolerance: 5,
      // },
    }),
    useSensor(KeyboardSensor, {
      // coordinateGetter: sortableKeyboardCoordinates, // If using sortable
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;

    if (!active || !over) {
      console.log("Drag ended prematurely or outside a droppable, active:", active, "over:", over);
      return;
    }

    const draggedItemData = active.data.current as DesktopItem & {
      originalPosition?: {x: number, y: number}, 
      sourceType?: string, 
      sourceWindowId?: string 
    };
    const dropTargetData = over.data.current as {
        type?: string, 
        folderId?: string, 
        path?: string 
    } | null;

    if (!draggedItemData || !draggedItemData.id) {
      console.warn("Dragged item data is missing or invalid", draggedItemData);
      return;
    }
    
    if (active.id === over.id && over.id !== 'desktop-droppable-area' && (!dropTargetData || dropTargetData.type !== 'folderWindow')) {
        console.log("Item dropped on itself (and not a general drop area), no action.");
        return;
    }

    const desktopRect = getDesktopRect();
    let newPathSuffix = draggedItemData.title.includes('.') ? draggedItemData.title : `${draggedItemData.title}`;

    if (over.id === 'desktop-droppable-area') {
      if (draggedItemData.originalPosition) { 
        console.log('Icon/Folder Drag End on Desktop - ID:', draggedItemData.id, 'Original:', draggedItemData.originalPosition, 'Delta:', delta);
        const newX = draggedItemData.originalPosition.x + delta.x;
        const newY = draggedItemData.originalPosition.y + delta.y;
        console.log('Calculated newX, newY before snap:', newX, newY);
        const snappedPosition = snapToGrid(newX, newY, { width: desktopRect.width, height: desktopRect.height });
        console.log('Snapped Position for Icon/Folder:', snappedPosition);

        dispatch({
          type: "UPDATE_ITEM_POSITION",
          payload: { itemId: draggedItemData.id, position: snappedPosition },
        });
        if (draggedItemData.parentId) {
          dispatch({
            type: "MOVE_ITEM",
            payload: { itemId: draggedItemData.id, newParentId: null, position: snappedPosition, newPath: `/${newPathSuffix}` },
          });
        }
        playSound("click");
        console.log(`Item ${draggedItemData.id} (from desktop/unknown) dropped on desktop at`, snappedPosition);
      } else if (draggedItemData.sourceType === 'folderWindowItem') { // Item dragged from a FolderWindow to the Desktop
        // Original placeholder logic for items from folder window:
        const placeholderX = delta.x + 50; // Arbitrary offset if originalPosition is missing
        const placeholderY = delta.y + 50;
        const snappedPosition = snapToGrid(placeholderX, placeholderY, { width: desktopRect.width, height: desktopRect.height });

        dispatch({
          type: "MOVE_ITEM",
          payload: { itemId: draggedItemData.id, newParentId: null, position: snappedPosition, newPath: `/${newPathSuffix}` },
        });
        playSound("click");
        console.log(`Item ${draggedItemData.id} from folder ${draggedItemData.sourceWindowId} dropped on desktop at`, snappedPosition);
      } else {
         console.warn("Item dropped on desktop without clear origin or originalPosition.");
      }
    } 
    // Scenario 2: Item dropped onto a Folder icon (on the Desktop)
    else if (dropTargetData?.type === 'folder') { // Target is a Desktop Folder Icon
      const targetFolderId = over.id as string;
      const targetFolderData = dropTargetData as DesktopItem; // This should be DesktopItem for a folder icon

      if (draggedItemData.id === targetFolderId || draggedItemData.parentId === targetFolderId) {
        console.log("Item dropped into itself or its current parent folder (desktop icon), no action.");
        return;
      }
      
      const basePath = targetFolderData.path || `/${targetFolderData.title}`;
      const finalNewPath = `${basePath}/${newPathSuffix}`.replace('//', '/');

      dispatch({
        type: "MOVE_ITEM",
        payload: {
          itemId: draggedItemData.id,
          newParentId: targetFolderId,
          newPath: finalNewPath,
        },
      });
      playSound("click");
      console.log(`Item ${draggedItemData.id} (from ${draggedItemData.sourceType || 'desktop'}) dropped into desktop folder ${targetFolderId}`);
    }
    // Scenario 3: Item dropped into a FolderWindow content area
    else if (dropTargetData?.type === 'folderWindow') {
      const targetFolderId = dropTargetData.folderId as string;
      const targetFolderPath = dropTargetData.path || '/'; // Path of the target folder window

      if (draggedItemData.parentId === targetFolderId) {
        console.log("Item dropped into the same folder window it originated from. No actual move, reordering TBD.");
        // Add reordering logic here if desired in the future for items within the same folder window.
        return;
      }
      
      // Prevent dropping a folder into itself if the target IS the dragged item (should be caught by active.id === over.id earlier)
      if (draggedItemData.id === targetFolderId && draggedItemData.type === 'folder') {
          console.log("Cannot drop a folder into itself (folder window target).");
          return;
      }

      const finalNewPath = `${targetFolderPath === '/' ? '' : targetFolderPath}/${newPathSuffix}`.replace('//', '/');

      dispatch({
        type: "MOVE_ITEM",
        payload: {
          itemId: draggedItemData.id,
          newParentId: targetFolderId,
          newPath: finalNewPath,
          // Position is managed by FolderWindow layout
        },
      });
      playSound("click");
      console.log(`Item ${draggedItemData.id} (from ${draggedItemData.sourceType || 'desktop'}) dropped into folder window ${targetFolderId}`);
    }
    // Scenario 4: Other unhandled drop targets (e.g. icon on icon that is not a folder)
    else {
      console.log("Item dropped on unhandled target or no specific action defined:", { active: active.id, over: over.id, dropTargetData });
    }
  }, [dispatch, playSound, snapToGrid, getDesktopRect]); // Removed state.desktopItems
  // --- End dnd-kit setup ---

  // Handle icon double-click to open windows
  const handleIconDoubleClick = useCallback(async (itemId: string) => {
    const item = state.desktopItems.find((i: DesktopItem) => i.id === itemId);

    if (!item) {
      console.error(`Desktop.tsx: Item not found for double click: ${itemId}`);
      return;
    }

    playSound("windowOpen");

    // Create app launcher config
    const launcherConfig: AppLauncherConfig = {
      dispatch,
      existingWindows: state.windows as Window[]
    };

    const projectDetails = state.projects.find((p: Project) => p.id === item.id);
    const itemTypeToSwitch = projectDetails?.type || item.type;

    switch (itemTypeToSwitch) {
      case "folder":
        openFolder(dispatch, item.id, item.title);
        break;

      case "project":
      case "interactive":
      case "code":
      case "visual":
        if (projectDetails) {
          if (projectDetails.id === "todo-list") {
            launchTodoList(launcherConfig, {
              title: projectDetails.title,
            });
          } else if (projectDetails.id === "weather-app") {
            launchWeatherApp(launcherConfig, {
              title: projectDetails.title,
            });
          } else if (projectDetails.live_link || projectDetails.demoUrl) {
            launchBrowser(launcherConfig, projectDetails.live_link || projectDetails.demoUrl, {
              title: projectDetails.title,
            });
          } else {
            launchProject(projectDetails.id, launcherConfig, {
              title: projectDetails.title,
            });
          }
        } else {
          console.warn(`Desktop.tsx: Project details not found for item ID ${item.id} (type ${item.type}). Opening generic project window for ${item.title}.`);
          launchProject(item.id, launcherConfig, {
            title: item.title,
          });
        }
        break;

      case "shortcut":
        if (!fileSystem.isReady) {
          console.error("Desktop.tsx: File system not ready to resolve shortcut for", item.title);
          return;
        }
        try {
          const targetPath = await fileSystem.resolveShortcut(item.id); 
          if (!targetPath) {
            console.error(`Desktop.tsx: Could not resolve shortcut target for: ${item.title} (ID: ${item.id})`);
            return;
          }

          if (targetPath.startsWith("app:")) {
            const appName = targetPath.substring(4);
            launchApplication(appName, launcherConfig, { title: item.title });
          } else {
            const targetInfo = await fileSystem.getFileInfo(targetPath);
            if (targetInfo) {
              if (targetInfo.isDirectory) {
                launchFileExplorer(launcherConfig, targetPath, {
                  title: item.title || targetPath.split("/").pop() || "Folder",
                });
              } else { 
                openFileWithAppropriateApp(targetPath, launcherConfig); 
              }
            } else {
              console.warn(`Desktop.tsx: Could not get info for shortcut target: ${targetPath}. Attempting to open as file.`);
              openFileWithAppropriateApp(targetPath, launcherConfig); 
            }
          }
        } catch (error) {
          console.error(`Desktop.tsx: Error handling shortcut ${item.title} (ID: ${item.id}):`, error);
        }
        break;

      default:
        console.log(`Desktop.tsx: Double-clicked on item with type: "${itemTypeToSwitch}" (ID: ${item.id}, Title: ${item.title}).`);
        if (item.path) {
          console.log(`Attempting to open ${item.title} as a file using its path: ${item.path}`);
          openFileWithAppropriateApp(item.path, launcherConfig); 
        } else if (projectDetails) {
           console.log(`Opening ${item.title} as a generic project window as it has projectDetails.`);
           launchProject(projectDetails.id, launcherConfig, {
            title: projectDetails.title,
          });
        } else {
          console.warn(`Desktop.tsx: Unhandled item type for double click: "${itemTypeToSwitch}" for item "${item.title}". No specific action defined.`);
        }
        break;
    }
  }, [dispatch, playSound, state.desktopItems, state.projects, state.windows, fileSystem]);

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

  // Refs for mouse down status to differentiate click from drag for selection box
  const isMouseDownForSelection = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleDesktopMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only initiate selection box if not clicking on an existing item or its children
    // and if it's a left click
    const target = e.target as HTMLElement;
    if (target.closest('[data-item-id]') || e.button !== 0) {
        isMouseDownForSelection.current = false; // Ensure it's reset
        return;
    }

    isMouseDownForSelection.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    // Initial selection box, possibly to be cleared if it's just a click
    setSelectionBox({
      active: true, // Tentatively active
      start: { x: e.clientX, y: e.clientY },
      end: { x: e.clientX, y: e.clientY },
    });

    // Clear selection if not holding Ctrl/Shift and not clicking on a selected item
    const clickedOnSelectedItem = selectedItems.size > 0 && target.closest(`[data-item-id='${Array.from(selectedItems)[0]}']`); // Simplistic check
    if (!e.ctrlKey && !e.shiftKey && !clickedOnSelectedItem) {
      setSelectedItems(new Set());
      lastSelectedItemRef.current = null;
    }
  };

  const handleDesktopMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownForSelection.current || !selectionBox?.active) return;

    // If mouse moved significantly, confirm selection box activity
    if (Math.abs(e.clientX - dragStartPos.current.x) > 5 || Math.abs(e.clientY - dragStartPos.current.y) > 5) {
        // If not already set, update selection box
    }

    setSelectionBox((prev) => {
      if (!prev) return null; // Should not happen if active
      return {
        ...prev,
        active: true, // Confirm active if mouse moved
        end: { x: e.clientX, y: e.clientY },
      };
    });
  };
  
  const handleDesktopMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMouseDownForSelection.current) {
      if (selectionBox && selectionBox.active) {
        // Check if it was a very small drag (potential click)
        const dx = Math.abs(selectionBox.end.x - selectionBox.start.x);
        const dy = Math.abs(selectionBox.end.y - selectionBox.start.y);
        if (dx < 5 && dy < 5) { // Threshold for distinguishing click from drag
          setSelectionBox(null); // It was a click, not a selection drag
          if (!e.ctrlKey && !e.shiftKey) { // Clear selection on simple click on desktop
             const target = e.target as HTMLElement;
             if (!target.closest('[data-item-id]')) { // Only if not clicking an item
                setSelectedItems(new Set());
                lastSelectedItemRef.current = null;
             }
          }
        } else {
          // Finalize selection based on selectionBox
          selectItemsInBox();
        }
      } else {
        // If selection box was not active but mouse down was true (e.g. tiny movement), treat as click
         setSelectionBox(null);
         if (!e.ctrlKey && !e.shiftKey) {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-item-id]')) {
               setSelectedItems(new Set());
               lastSelectedItemRef.current = null;
            }
         }
      }
    }
    isMouseDownForSelection.current = false;
    // Don't set selectionBox to null here if it was a real selection,
    // it might be used for rendering, then cleared after selection is processed
    // Or clear it if selection is done:
    // setSelectionBox(null); // Uncomment if selection box should disappear immediately
  };

  const selectItemsInBox = useCallback(() => {
    if (!selectionBox || !desktopContainerRef.current) return;

    const desktopRect = getDesktopRect();
    const selRect = getSelectionRect(selectionBox.start, selectionBox.end);

    // Adjust selection rect relative to the desktop container's viewport
    const adjustedSelRect = {
        left: selRect.left - desktopRect.left,
        top: selRect.top - desktopRect.top,
        right: selRect.right - desktopRect.left,
        bottom: selRect.bottom - desktopRect.top,
    };

    const newSelectedItems = new Set<string>();
    state.desktopItems.forEach((item: DesktopItem) => {
      if (item.parentId !== null) return; // Only select top-level desktop items

      const itemElement = desktopContainerRef.current?.querySelector(`[data-item-id='${item.id}']`) as HTMLElement;
      if (itemElement) {
        const itemRect = {
          left: itemElement.offsetLeft,
          top: itemElement.offsetTop,
          right: itemElement.offsetLeft + itemElement.offsetWidth,
          bottom: itemElement.offsetTop + itemElement.offsetHeight,
        };
        if (doRectsIntersect(adjustedSelRect, itemRect)) {
          newSelectedItems.add(item.id);
        }
      }
    });
    
    // If not holding Ctrl, new selection replaces old. If holding Ctrl, add to existing.
    // Shift key for selection box is typically "new selection"
    setSelectedItems(newSelectedItems); 
    if (newSelectedItems.size > 0) {
        // For shift-click, the "last selected" should ideally be based on
        // click order, not just the first in the new set. This might need refinement.
        lastSelectedItemRef.current = Array.from(newSelectedItems)[0];
    } else {
        lastSelectedItemRef.current = null;
    }
    setSelectionBox(null); // Clear selection box after processing
  }, [selectionBox, state.desktopItems, getDesktopRect]);

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

  // Keyboard shortcuts for desktop
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const allIds = new Set(state.desktopItems.map(item => item.id));
        setSelectedItems(allIds);
      }
      if (e.key === 'Delete' && selectedItems.size > 0) {
        e.preventDefault();
        const itemsToDeleteArray = Array.from(selectedItems);
        for (const id of itemsToDeleteArray) { 
          const itemToDelete = state.desktopItems.find(item => item.id === id);
          if (itemToDelete) {
            let deleteSuccess = true;
            if (itemToDelete.path && (itemToDelete.type === 'file' || itemToDelete.type === 'folder' || itemToDelete.type.startsWith('text') || itemToDelete.type === 'imageviewer')) {
              try {
                if (itemToDelete.type === 'folder') {
                  await fileSystem.removeDirectory(itemToDelete.path);
                } else {
                  await fileSystem.deleteFile(itemToDelete.path);
                }
              } catch (error) {
                deleteSuccess = false;
                console.error(`Failed to delete ${itemToDelete.type} from FS: ${itemToDelete.path}`, error);
              }
            }
            if (deleteSuccess) {
              dispatch({ type: "DELETE_ITEM", payload: { id } });
            }
          }
        }
        setSelectedItems(currentSelected => {
          const newSelected = new Set(currentSelected);
          itemsToDeleteArray.forEach(id => newSelected.delete(id));
          if (newSelected.size === 0) lastSelectedItemRef.current = null;
          return newSelected;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, selectedItems, state.desktopItems, fileSystem]);

  const handleContextMenuDelete = useCallback(async () => {
    let idsToAttemptDelete = new Set<string>();
    if (contextMenu.targetId && selectedItems.has(contextMenu.targetId)) {
      idsToAttemptDelete = new Set(selectedItems);
    } else if (contextMenu.targetId) {
      idsToAttemptDelete = new Set([contextMenu.targetId]);
    }

    if (idsToAttemptDelete.size === 0) return;

    const successfullyDeletedIds = new Set<string>();
    for (const id of idsToAttemptDelete) {
      const itemToDelete = state.desktopItems.find(item => item.id === id);
      if (itemToDelete) {
        let deleteSuccess = true;
        if (itemToDelete.path && (itemToDelete.type === 'file' || itemToDelete.type === 'folder' || itemToDelete.type.startsWith('text') || itemToDelete.type === 'imageviewer')) {
          try {
            if (itemToDelete.type === 'folder') {
              await fileSystem.removeDirectory(itemToDelete.path);
            } else {
              await fileSystem.deleteFile(itemToDelete.path);
            }
          } catch (error) {
            deleteSuccess = false;
            console.error(`Failed to delete ${itemToDelete.type} from FS (context menu): ${itemToDelete.path}`, error);
          }
        }
        if (deleteSuccess) {
          dispatch({ type: "DELETE_ITEM", payload: { id } });
          successfullyDeletedIds.add(id);
        }
      }
    }

    if (successfullyDeletedIds.size > 0) {
      setSelectedItems(currentSelected => {
        const newSelection = new Set(currentSelected);
        successfullyDeletedIds.forEach(id => newSelection.delete(id));
        if (newSelection.size === 0) lastSelectedItemRef.current = null;
        return newSelection;
      });
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
    // playSound("delete"); // Consider a specific delete sound
  }, [contextMenu.targetId, selectedItems, state.desktopItems, fileSystem, dispatch]);

  // Context menu items
  const contextMenuItems = useMemo(() => {
    const menu = [
      { label: "Change Background", action: cycleBackground },
      {
        label: "New Folder", action: () => {
          const folderId = uuidv4();
          const containerRect = desktopContainerRef.current?.getBoundingClientRect();
          const rawX = Math.max(10, contextMenu.position.x - (containerRect?.left || 0) - DESKTOP_ICON_WIDTH / 2);
          const rawY = Math.max(10, contextMenu.position.y - (containerRect?.top || 0) - DESKTOP_ICON_HEIGHT / 2);
          const rectForSnapping = containerRect ? 
              { width: containerRect.width, height: containerRect.height - TASKBAR_HEIGHT} : 
              { width: window.innerWidth, height: window.innerHeight - TASKBAR_HEIGHT };
          const snappedPosition = snapToGrid(rawX, rawY, rectForSnapping);
          dispatch({
            type: "CREATE_FOLDER",
            payload: { id: folderId, title: "New Folder", icon: "/assets/win98-icons/png/directory_closed-1.png", items: [], position: snappedPosition, parentId: null }
          });
          setContextMenu(prev => ({ ...prev, visible: false }));
          playSound("click");
        }
      },
    ];

    if (contextMenu.targetId && contextMenu.targetType !== 'desktop') {
      menu.push({ label: "Delete", action: handleContextMenuDelete });
    }

    menu.push({ label: "Refresh", action: () => window.location.reload() });
    return menu;
  }, [cycleBackground, contextMenu.position, contextMenu.targetId, contextMenu.targetType, dispatch, playSound, snapToGrid, handleContextMenuDelete]);

  // Get desktop items (not inside folders)
  const desktopItemsToRender = useMemo(() =>
    state.desktopItems.filter(item => !item.parentId),
    [state.desktopItems]
  );

  const handleItemClick = useCallback((e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // Prevent desktop click handler from firing
    // playSound("click"); // playSound is called by context menu click, not needed here if it causes issues or is redundant

    const currentDesktopItems = state.desktopItems.filter(item => !item.parentId);

    if (e.shiftKey) {
      if (lastSelectedItemRef.current && lastSelectedItemRef.current !== itemId) {
        const lastClickedIndex = currentDesktopItems.findIndex(item => item.id === lastSelectedItemRef.current);
        const currentClickedIndex = currentDesktopItems.findIndex(item => item.id === itemId);

        if (lastClickedIndex !== -1 && currentClickedIndex !== -1) {
          const start = Math.min(lastClickedIndex, currentClickedIndex);
          const end = Math.max(lastClickedIndex, currentClickedIndex);
          const itemsToSelect = currentDesktopItems.slice(start, end + 1).map(item => item.id);
          
          setSelectedItems(prevSelected => {
            const newSelection = e.ctrlKey ? new Set<string>(prevSelected) : new Set<string>();
            itemsToSelect.forEach(id => newSelection.add(id));
            if (!e.ctrlKey) newSelection.add(lastSelectedItemRef.current!); 
            newSelection.add(itemId);
            return newSelection;
          });
        }
      } else {
        // Shift-click without a previous anchor, or clicking the anchor itself: select only this item
        setSelectedItems(new Set<string>([itemId]));
        lastSelectedItemRef.current = itemId;
      }
    } else if (e.ctrlKey) {
      // Ctrl-click: toggle selection for this item
      setSelectedItems(prevSelected => {
        const newSelection = new Set<string>(prevSelected);
        if (newSelection.has(itemId)) {
          newSelection.delete(itemId);
        } else {
          newSelection.add(itemId);
          lastSelectedItemRef.current = itemId;
        }
        return newSelection;
      });
    } else {
      // Plain click: select only this item
      setSelectedItems(new Set<string>([itemId]));
      lastSelectedItemRef.current = itemId;
    }
    // playSound("click"); // Moved to top of function, then decided to remove if redundant with context menu sound
  }, [state.desktopItems]); // Removed playSound

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} >
      <div
        ref={desktopContainerRef}
        className={`${styles.desktop} ${isOverDesktop ? styles.desktopDropTarget : ''}`}
        style={{
          backgroundImage: `url(${backgrounds[backgroundIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
        onClick={handleDesktopClick}
        onContextMenu={handleDesktopRightClick}
        onMouseDown={handleDesktopMouseDown}
        onMouseMove={handleDesktopMouseMove}
        onMouseUp={handleDesktopMouseUp}
        tabIndex={0}
      >
        <div ref={setDesktopDroppableRef} className={styles.desktopIconsArea}>
          {desktopItemsToRender.map((item: DesktopItem) => 
            item.type === "folder" ? (
              <Folder
                key={item.id}
                id={item.id}
                title={item.title}
                position={item.position}
                icon={item.icon}
                onDoubleClick={() => handleIconDoubleClick(item.id)}
                isSelected={selectedItems.has(item.id)}
                onItemClick={handleItemClick}
                isCut={item.isCut}
                type="folder"
                parentId={item.parentId}
              />
            ) : (
              <Icon
                key={item.id}
                id={item.id}
                title={item.title}
                type={item.type}
                icon={item.icon || ""}
                position={item.position}
                onDoubleClick={() => handleIconDoubleClick(item.id)}
                isSelected={selectedItems.has(item.id)}
                onItemClick={handleItemClick}
                isCut={item.isCut}
                parentId={item.parentId}
              />
            )
          )}
        </div>

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

        <WindowManager />
        {state.startMenuOpen && <StartMenu />}
        {contextMenu.visible && (
          <ContextMenu
            items={contextMenuItems}
            position={contextMenu.position}
            targetId={contextMenu.targetId}
            targetType={contextMenu.targetType}
            selectedItemIds={selectedItems}
            onClose={handleContextMenuClose}
            desktopOffset={{
              left: desktopContainerRef.current?.getBoundingClientRect().left || 0,
              top: desktopContainerRef.current?.getBoundingClientRect().top || 0,
            }}
          />
        )}
        <Taskbar onStartClick={handleStartClick} />
      </div>
    </DndContext>
  );
};

export default Desktop;