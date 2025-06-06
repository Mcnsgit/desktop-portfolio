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
// import { useDesktop } from "../../context/DesktopContext"; // To be replaced
import { useSounds } from "../../hooks/useSounds";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import Icon from "./Icon"; // Will need to adapt props
import FolderComponent from "./Folder"; // Renamed to avoid conflict with ModelFolder
import Taskbar from "./Taskbar"; // Will need to adapt props
import StartMenu from "./StartMenu"; // Will need to adapt props
import WindowManagerComponent from "../windows/WindowManager"; // Renamed
import ContextMenu from "./ContextMenu"; // Will need to adapt props
import styles from "./Desktop.module.scss";
// import { v4 as uuidv4 } from "uuid"; // Not used in model-driven version
// import { DesktopItem, Window, Project } from "../../types"; // Old types, review later
import { useFileSystem } from "../../context/FileSystemContext";
// App launching is now handled by the DesktopModel, so these imports are no longer needed
// import { launchApplication, launchProject, etc. } from "../../utils/appLauncher";
// import { openFolder as openFolderUtil } from "../../utils/windowServices/fileHandlers";
import { DESKTOP_ICON_WIDTH, DESKTOP_ICON_HEIGHT, TASKBAR_HEIGHT } from "../../utils/constants";

// --- Import New Model Classes ---
import { Desktop as DesktopModel } from "../../../src/model/Desktop";
import { IDesktopItem, ItemType } from "../../../src/model/DesktopItem";
import { File as ModelFile } from "../../../src/model/File";
import { Folder as ModelFolder } from "../../../src/model/Folder";
import { App as ModelApp } from "../../../src/model/App";
// import { WindowModel } from "../../../src/model/Window"; // Not directly used in Desktop.tsx
// import { TaskbarWindow } from "./Taskbar"; // Type not directly used, inline object type is sufficient

// Import icons from lucide-react
import {
  Trash,
  FolderPlus,
  RefreshCcw,
  PenTool,
  Maximize
} from 'lucide-react';

const DESKTOP_ROOT_PATH = "/home/guest/Desktop"; // Define a constant for the desktop path

// Backgrounds can be customized
const backgrounds = [
  "/backgrounds/retro_background_1.jpeg",
  "/backgrounds/retro_background_2.jpeg",
  "/backgrounds/retro_background_3.jpeg",
];

const Desktop: React.FC = () => {
  const fileSystem = useFileSystem();
  const { playSound } = useSounds();
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const lastSelectedItemRef = useRef<string | null>(null);
  const isMouseDownForSelection = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const [desktopVersion, setDesktopVersion] = useState(0);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; position: { x: number; y: number }; targetId?: string; targetType?: ItemType | 'desktop'; }>({ visible: false, position: { x: 0, y: 0 } });
  const [selectionBox, setSelectionBox] = useState<{ active: boolean; start: { x: number; y: number }; end: { x: number; y: number }; } | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  const forceUpdate = useCallback(() => setDesktopVersion(v => v + 1), []);

  const desktopModel = useMemo(() => {
    if (fileSystem.isReady && fileSystem.fsInstance) {
      return new DesktopModel(fileSystem.fsInstance);
    }
    return null;
  }, [fileSystem.isReady, fileSystem.fsInstance]);

  // Define ALL hooks before any conditional returns
  const { setNodeRef: setDesktopDroppableRef, isOver: isOverDesktop } = useDroppable({ id: 'desktop-droppable-area' });
  useKeyboardShortcuts({ 
    desktopModel, 
    onToggleStartMenu: () => setStartMenuOpen(prev => !prev), 
    forceUpdate 
  });

  const getDesktopRect = useCallback(() => {
    const desktopEl = desktopContainerRef.current;
    if (desktopEl) {
      const rect = desktopEl.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight - TASKBAR_HEIGHT, 
    };
  }, []); 

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
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (!desktopModel || !fileSystem.isReady || !fileSystem.fsInstance) return;
    if (desktopModel.items.length === 0) {
      const desktopPath = DESKTOP_ROOT_PATH;
      if (!fileSystem.fsInstance.existsSync(desktopPath)) {
        try { 
          fileSystem.fsInstance.mkdirSync(desktopPath, { recursive: true }); 
        } catch (e) { 
          console.error(`Desktop.tsx: Failed to create ${desktopPath}:`, e); 
        }
      }
      
      // Load portfolio content from .lnk files created by BrowserFileSystem
      desktopModel.loadInitialDesktopItems(desktopPath)
        .then(() => {
          console.log(`[Desktop] Portfolio content loaded successfully`);
          forceUpdate();
        })
        .catch(err => {
          console.error("Error loading portfolio desktop items:", err);
          // Fallback: create basic sample items if portfolio loading fails
          const myDoc = new ModelFile("MyDocument.txt", "Hello world content!", `${desktopPath}/MyDocument.txt`); 
          (myDoc as any).position = { x: 50, y: 50 }; 
          desktopModel.addItem(myDoc);
          forceUpdate();
        });
    }
  }, [desktopModel, forceUpdate, fileSystem.isReady, fileSystem.fsInstance]);

  // Moved derived data hooks before the main conditional return
  const desktopItemsToRender = useMemo(() => {
    if (!desktopModel) return [];
    return desktopModel.items.map(item => ({ ...item, position: (item as any).position || { x: 0, y: 0 } }));
  }, [desktopModel, desktopVersion]);

  const windowsToRender = useMemo(() => {
    if (!desktopModel) return [];
    return desktopModel.windowManager.getWindowsForUI();
  }, [desktopModel, desktopVersion]);

  // const activeWindowIdFromModel = useMemo(() => {
  //   if (!desktopModel) return null;
  //   return desktopModel.windowManager.getFocusedWindow()?.id || null;
  // }, [desktopModel, desktopVersion]); // Not currently used
  
  const taskbarWindows = useMemo(() => {
    // This depends on windowsToRender, which already guards for desktopModel
    return windowsToRender.map(w => ({ id: w.id, title: w.title, isActive: w.isFocused, isMinimized: w.isMinimized }));
  }, [windowsToRender]);


  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (!desktopModel) return;
    const { active, over, delta } = event;
    if (!active || !over) return;

    const draggedItemModel = desktopModel.findItemById(active.id as string);
    if (!draggedItemModel) return;

    const originalPosition = (draggedItemModel as any).position || { x: 0, y: 0 };

    if (over.id === 'desktop-droppable-area' || over.id === desktopModel.id) {
      const desktopRect = getDesktopRect();
      const newX = originalPosition.x + delta.x;
      const newY = originalPosition.y + delta.y;
      const snappedPosition = snapToGrid(newX, newY, { width: desktopRect.width, height: desktopRect.height });
      (draggedItemModel as any).position = snappedPosition;
      desktopModel.moveItem(active.id as string, desktopModel.id);
      playSound("click");
      forceUpdate();
    } else if (over.data.current?.type !== 'folderWindowContent' && desktopModel.findItemById(over.id as string)?.type === 'Folder') {
      const targetFolderId = over.id as string;
      desktopModel.moveItem(active.id as string, targetFolderId);
      if ((draggedItemModel as any).position) delete (draggedItemModel as any).position;
      playSound("click");
      forceUpdate();
    } else if (over.data.current?.type === 'folderWindowContent') {
      const targetFolderId = over.data.current.targetFolderId as string;
      const targetFolderPath = over.data.current.targetFolderPath as string;
      if (targetFolderId) {
        desktopModel.moveItem(active.id as string, targetFolderId, targetFolderPath);
        if ((draggedItemModel as any).position) delete (draggedItemModel as any).position;
        playSound("click");
        forceUpdate();
      }
    }
  }, [desktopModel, playSound, snapToGrid, getDesktopRect, forceUpdate]);

  const handleIconDoubleClick = useCallback(async (itemId: string) => {
    if (!desktopModel) return;
    desktopModel.handleDoubleClick(itemId);
    playSound("windowOpen");
    forceUpdate();
  }, [desktopModel, playSound, forceUpdate]);

  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    if (contextMenu.visible) {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
    if (!e.ctrlKey && !selectionBox?.active) {
      setSelectedItems(new Set());
    }
  }, [contextMenu.visible, selectionBox]);

  const handleDesktopRightClick = useCallback((e: React.MouseEvent) => {
    if (!desktopModel) return;
    e.preventDefault();
    playSound("click");
    const target = e.target as HTMLElement;
    const desktopItemElement = target.closest('[data-item-id]');
    let targetId: string | undefined, targetType: ItemType | 'desktop' | undefined;

    if (desktopItemElement) {
      targetId = desktopItemElement.getAttribute('data-item-id') || undefined;
      const modelItem = targetId ? desktopModel.findItemById(targetId) : null;
      targetType = modelItem ? modelItem.type : undefined;
    } else {
      targetType = 'desktop';
    }
    setContextMenu({ visible: true, position: { x: e.clientX, y: e.clientY }, targetId, targetType });
  }, [desktopModel, playSound]);

  const handleContextMenuClose = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const cycleBackground = useCallback(() => {
    setBackgroundIndex(prev => (prev + 1) % backgrounds.length);
    playSound("click");
  }, [playSound]);

  const handleStartClick = useCallback(() => {
    setStartMenuOpen(prev => !prev);
    playSound("click");
  }, [playSound]);

  const handleDesktopMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-item-id]') || e.button !== 0) {
        isMouseDownForSelection.current = false;
        return;
    }
    isMouseDownForSelection.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setSelectionBox({
      active: true,
      start: { x: e.clientX, y: e.clientY },
      end: { x: e.clientX, y: e.clientY },
    });
    const clickedOnSelectedItem = selectedItems.size > 0 && target.closest(`[data-item-id='${Array.from(selectedItems)[0]}']`);
    if (!e.ctrlKey && !e.shiftKey && !clickedOnSelectedItem) {
      setSelectedItems(new Set());
      lastSelectedItemRef.current = null;
    }
  };

  const handleDesktopMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownForSelection.current || !selectionBox?.active) return;
    setSelectionBox((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        active: true,
        end: { x: e.clientX, y: e.clientY },
      };
    });
  };
  
  const handleDesktopMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMouseDownForSelection.current) {
      if (selectionBox && selectionBox.active) {
        const dx = Math.abs(selectionBox.end.x - selectionBox.start.x);
        const dy = Math.abs(selectionBox.end.y - selectionBox.start.y);
        if (dx < 5 && dy < 5) {
          setSelectionBox(null);
          if (!e.ctrlKey && !e.shiftKey) {
             const target = e.target as HTMLElement;
             if (!target.closest('[data-item-id]')) {
                setSelectedItems(new Set());
                lastSelectedItemRef.current = null;
             }
          }
        } else {
          selectItemsInBox();
        }
      } else {
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
  };

  const selectItemsInBox = useCallback(() => {
    if (!desktopModel || !selectionBox || !desktopContainerRef.current) return;
    const desktopRect = getDesktopRect(); 
    const selRect = getSelectionRect(selectionBox.start, selectionBox.end);
    const selRectRelative = {
        left: selRect.left - desktopRect.left, top: selRect.top - desktopRect.top,
        right: selRect.right - desktopRect.left, bottom: selRect.bottom - desktopRect.top,
    };
    const newSelectedItems = new Set<string>();
    desktopModel.items.forEach((item: IDesktopItem) => {
      const itemPosition = (item as any).position;
      if (itemPosition) {
        const itemRect = { left: itemPosition.x, top: itemPosition.y, right: itemPosition.x + DESKTOP_ICON_WIDTH, bottom: itemPosition.y + DESKTOP_ICON_HEIGHT };
        if (doRectsIntersect(selRectRelative, itemRect)) newSelectedItems.add(item.id);
      }
    });
    setSelectedItems(newSelectedItems); 
    lastSelectedItemRef.current = newSelectedItems.size > 0 ? Array.from(newSelectedItems)[0] : null;
    setSelectionBox(null);
  }, [desktopModel, selectionBox, getDesktopRect]);

  const getSelectionRect = (start: { x: number, y: number }, end: { x: number, y: number }) => {
    return {
      left: Math.min(start.x, end.x),
      top: Math.min(start.y, end.y),
      right: Math.max(start.x, end.x),
      bottom: Math.max(start.y, end.y),
    };
  };

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

  useEffect(() => {
    if (!desktopModel) return;
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSelectedItems(new Set(desktopModel.items.map(item => item.id)));
      }
      if (e.key === 'Delete' && selectedItems.size > 0) {
        e.preventDefault();
        selectedItems.forEach(id => desktopModel.removeItem(id));
        setSelectedItems(new Set());
        lastSelectedItemRef.current = null;
        forceUpdate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [desktopModel, selectedItems, forceUpdate, fileSystem]);

  const handleContextMenuDelete = useCallback(async () => {
    if (!desktopModel) return;
    let idsToAttemptDelete = new Set<string>();
    if (contextMenu.targetId && selectedItems.has(contextMenu.targetId)) {
      idsToAttemptDelete = new Set(selectedItems);
    } else if (contextMenu.targetId) {
      idsToAttemptDelete = new Set([contextMenu.targetId]);
    }
    if (idsToAttemptDelete.size === 0) return;
    for (const id of idsToAttemptDelete) {
        const item = desktopModel.findItemById(id);
        if (item) {
            desktopModel.removeItem(id);
            playSound("click");
        }
    }
    setSelectedItems(currentSelected => {
      const newSelection = new Set(currentSelected);
      idsToAttemptDelete.forEach(id => newSelection.delete(id));
      if (newSelection.size === 0) lastSelectedItemRef.current = null;
      return newSelection;
    });
    setContextMenu(prev => ({ ...prev, visible: false }));
    forceUpdate();
  }, [desktopModel, contextMenu.targetId, selectedItems, forceUpdate, playSound]);

  const contextMenuItemsFromModel = useMemo(() => {
    if (!desktopModel) return [];
    const menu: {label: string, action: () => void, icon?: React.ReactNode, disabled?: boolean, danger?: boolean}[] = [];
    const targetItem = contextMenu.targetId ? desktopModel.findItemById(contextMenu.targetId) : null;

    if (contextMenu.targetType === 'desktop' || (contextMenu.targetType === 'Folder' && targetItem?.type === 'Folder')) {
      menu.push({ 
        label: "New Folder", icon: <FolderPlus size={16} />,
        action: () => {
          if (!desktopModel) return;
          const newFolderName = window.prompt("Enter folder name:", "New Folder");
          if (newFolderName) {
            let parentPath = DESKTOP_ROOT_PATH;
            if (contextMenu.targetType === 'Folder' && targetItem && targetItem.path) parentPath = targetItem.path;
            if (!parentPath) return;
            const createdFolder = desktopModel.createDirectory(parentPath, newFolderName);
            if (createdFolder && (createdFolder as any).position === undefined) {
                const containerRect = desktopContainerRef.current?.getBoundingClientRect();
                const rawX = Math.max(10, contextMenu.position.x - (containerRect?.left || 0) - DESKTOP_ICON_WIDTH / 2);
                const rawY = Math.max(10, contextMenu.position.y - (containerRect?.top || 0) - DESKTOP_ICON_HEIGHT / 2);
                const rectForSnapping = containerRect ? { width: containerRect.width, height: containerRect.height } : { width: window.innerWidth, height: window.innerHeight - TASKBAR_HEIGHT };
                (createdFolder as any).position = snapToGrid(rawX, rawY, rectForSnapping);
            }
            forceUpdate();
          }
          setContextMenu(prev => ({ ...prev, visible: false }));
          playSound("click");
        }
      });
    }
    if (targetItem) {
      if (targetItem.type !== 'Folder' && selectedItems.size <= 1) {
        menu.push({ 
          label: "Open", icon: <Maximize size={16} />,
          action: () => {
            if (!desktopModel) return;
            desktopModel.handleDoubleClick(targetItem.id);
            setContextMenu(prev => ({ ...prev, visible: false }));
          }
        });
      }
      menu.push({ 
        label: selectedItems.size > 1 ? "Delete Items" : "Delete", icon: <Trash size={16} />,
        action: handleContextMenuDelete, danger: true,
        disabled: selectedItems.size === 0 && !targetItem 
      });
    }
    menu.push({ label: "Change Background", icon: <PenTool size={16} />, action: cycleBackground }); 
    menu.push({ label: "Refresh", icon: <RefreshCcw size={16} />, action: () => { forceUpdate(); playSound("click"); setContextMenu(prev => ({ ...prev, visible: false })); }});
    return menu;
  }, [desktopModel, contextMenu, selectedItems, cycleBackground, forceUpdate, playSound, snapToGrid, handleContextMenuDelete]);


  const handleItemClick = useCallback((e: React.MouseEvent, itemId: string) => {
    if (!desktopModel) return;
    e.stopPropagation();
    const currentDesktopItemsForSelection = desktopModel.items.filter(item => item.parentId === desktopModel.id);
    if (e.shiftKey) {
      if (lastSelectedItemRef.current && lastSelectedItemRef.current !== itemId) {
        const lastClickedIndex = currentDesktopItemsForSelection.findIndex(item => item.id === lastSelectedItemRef.current);
        const currentClickedIndex = currentDesktopItemsForSelection.findIndex(item => item.id === itemId);

        if (lastClickedIndex !== -1 && currentClickedIndex !== -1) {
          const start = Math.min(lastClickedIndex, currentClickedIndex);
          const end = Math.max(lastClickedIndex, currentClickedIndex);
          const itemsToSelect = currentDesktopItemsForSelection.slice(start, end + 1).map(item => item.id);
          
          setSelectedItems(prevSelected => {
            const newSelection = e.ctrlKey ? new Set<string>(prevSelected) : new Set<string>();
            itemsToSelect.forEach(id => newSelection.add(id));
            if (!e.ctrlKey) newSelection.add(lastSelectedItemRef.current!); 
            newSelection.add(itemId); 
            return newSelection;
          });
        } else {
           setSelectedItems(new Set<string>([itemId]));
           lastSelectedItemRef.current = itemId;
        }
      } else {
        setSelectedItems(new Set<string>([itemId]));
        lastSelectedItemRef.current = itemId;
      }
    } else if (e.ctrlKey) {
      setSelectedItems(prevSelected => {
        const newSelection = new Set<string>(prevSelected);
        if (newSelection.has(itemId)) {
          newSelection.delete(itemId);
        } else {
          newSelection.add(itemId);
        }
        lastSelectedItemRef.current = newSelection.has(itemId) ? itemId : null;
        return newSelection;
      });
    } else {
      setSelectedItems(new Set<string>([itemId]));
      lastSelectedItemRef.current = itemId;
    }
  }, [desktopModel]);

  const handleWindowSelectFromTaskbar = useCallback((windowId: string): void => {
    if (!desktopModel) return;
    desktopModel.windowManager.setFocus(windowId);
    const window = desktopModel.windowManager.findWindowById(windowId);
    if (window && window.isMinimized) desktopModel.windowManager.restoreWindow(windowId);
    forceUpdate();
  }, [desktopModel, forceUpdate]);

  const handleStartMenuAction = useCallback((actionIdentifier: string, payload?: any) => {
    if (!desktopModel) return;
    console.log("StartMenu Action:", actionIdentifier, payload);
    switch (actionIdentifier) {
        case "open_app":
            if (payload?.appType && payload?.title) desktopModel.createAndOpenWindowFromType(payload.appType, payload.title, payload);
            break;
        case "open_url":
            if (payload?.url) window.open(payload.url, "_blank");
            break;
        case "shutdown_system":
            window.location.reload(); 
            break;
    }
    setStartMenuOpen(false); 
    forceUpdate();
  }, [desktopModel, forceUpdate]);

  // Main conditional return for loading state
  if (!desktopModel) {
    return <div style={{width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#008080", color: "white", fontSize: "2em"}}>Loading RetroOS Desktop...</div>;
  }

  // JSX Render (only if desktopModel is not null)
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
          {desktopItemsToRender.map((item: IDesktopItem & { position: { x: number, y: number }}) => {
            if (item.type === 'Folder') {
              return (
                <FolderComponent
                  key={item.id}
                  item={item}
                  position={item.position}
                  onDoubleClick={() => handleIconDoubleClick(item.id)}
                  isSelected={selectedItems.has(item.id)}
                  onItemClick={handleItemClick}
                />
              )
            } else {
              return (
                <Icon
                  key={item.id}
                  item={item}
                  position={item.position}
                  onDoubleClick={() => handleIconDoubleClick(item.id)}
                  isSelected={selectedItems.has(item.id)}
                  onItemClick={handleItemClick}
                />
              )
            }
          })}
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
        
        <WindowManagerComponent windows={windowsToRender} desktopModel={desktopModel} forceUpdate={forceUpdate} />

        <StartMenu 
          isOpen={startMenuOpen} 
          onAction={handleStartMenuAction} 
          onClose={() => setStartMenuOpen(false)} 
        />
        {contextMenu.visible && (
          <ContextMenu
            items={contextMenuItemsFromModel}
            position={contextMenu.position}
            targetId={contextMenu.targetId}
            targetType={contextMenu.targetType as string}
            selectedItemIds={selectedItems}
            onClose={handleContextMenuClose}
          />
        )}
        <Taskbar
          windows={taskbarWindows}
          onWindowSelect={handleWindowSelectFromTaskbar}
          onStartClick={handleStartClick}
        />
      </div>
    </DndContext>
  );
};

export default Desktop;