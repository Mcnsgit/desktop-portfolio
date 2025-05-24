import React, { createContext, useReducer, useContext, useRef, Dispatch, useCallback, useEffect } from "react";
import { Window, DesktopItem, DesktopAction, DesktopState } from "../types";
import { Z_INDEX } from "../utils/constants";
import { TASKBAR_HEIGHT } from "../utils/constants";
import { portfolioProjects } from '../data/portfolioData'
import { isDescendant } from '../utils/windowServices/isDescendant';
import { getDefaultIcon } from '../utils/iconUtils';

const DESKTOP_POSITIONS_STORAGE_KEY = 'desktop-items-positions';

const loadDesktopItemPositions = (): Record<string, { x: number; y: number }> => {
  if (typeof window !== 'undefined') {
    try {
      const storedPositions = localStorage.getItem(DESKTOP_POSITIONS_STORAGE_KEY);
      return storedPositions ? JSON.parse(storedPositions) : {};
    } catch (e) {
      console.error("Failed to parse desktop positions from localStorage", e);
    }
  }
  return {};
};
// Helper function to batch save positions to localStorage
const saveDesktopItemPositions = (id: string, position: { x: number; y: number; }) => {
  if (typeof window !== 'undefined') {
    try {
      const currentPositions = loadDesktopItemPositions();
      currentPositions[id] = position;
      localStorage.setItem(DESKTOP_POSITIONS_STORAGE_KEY, JSON.stringify(currentPositions));
    } catch (e) {
      console.error("Failed to save desktop positions to localStorage", e);
    }
  }
};
// Helper function to remove a single item's position
const removeDesktopItemPosition = (itemId: string) => {
    if (typeof window !== 'undefined') {
        try {
            const currentPositions = loadDesktopItemPositions();
            delete currentPositions[itemId];
            saveDesktopItemPositions(itemId, currentPositions[itemId] || {x: 0, y: 0});
        } catch (e) {
            console.error("Failed to remove desktop position from localStorage", e);
        }
    }
};

const desktopReducer = (state: DesktopState, action: DesktopAction): DesktopState => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`DesktopContext Reducer - Action: ${action.type}`, (action as any).payload);
  }
  switch (action.type) {
    case "INIT_PROJECTS": {
      const savedPositions = loadDesktopItemPositions();
      const initialDesktopItems = action.payload.projects.map((project, index): DesktopItem => {
        const padding = 16;
        const gridCellWidth = 80;
        const gridCellHeight = 90;
        const gridGap = 8;
        const itemsPerRow = 8;
        const columnIndex = index % itemsPerRow;
        const rowIndex = Math.floor(index / itemsPerRow);
        const defaultX = padding + columnIndex * (gridCellWidth + gridGap);
        const defaultY = padding + rowIndex * (gridCellHeight + gridGap);
        const savedPosition = savedPositions[project.id];
        return {
          id: project.id,
          title: project.title,
          icon: project.icon || "/assets/win98-icons/png/directory_open_cool-1.png",
          type: project.type || "project",
          position: savedPosition || { x: defaultX, y: defaultY },
          parentId: project.parentId ?? null,
          path: project.path,
        };
      });
      const combinedItems = [...initialDesktopItems, ...state.desktopItems.filter(item => !action.payload.projects.some(p => p.id === item.id))];
      return { ...state, projects: action.payload.projects, desktopItems: combinedItems, folders: state.folders };
    }
    case "OPEN_WINDOW": {
      const existingWindow = state.windows.find(w => w.id === action.payload.id);
      if (existingWindow) {
        if (existingWindow.minimized) {
          return desktopReducer(state, { type: 'RESTORE_WINDOW', payload: { id: action.payload.id } });
        }
        return desktopReducer(state, { type: 'FOCUS_WINDOW', payload: { id: action.payload.id } });
      }
      const highestZIndex = Math.max(Z_INDEX.WINDOW_NORMAL, ...state.windows.map(w => w.zIndex || Z_INDEX.WINDOW_NORMAL));
      let position = action.payload.position;
      if (!position) {
        const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
        const windowWidth = action.payload.size?.width || 500;
        const windowHeight = action.payload.size?.height || 400;
        
        const padding = 20; // Min padding from screen edges
        const usableWidth = winW - (2 * padding);
        const usableHeight = winH - TASKBAR_HEIGHT - (2 * padding); // Account for taskbar and top/bottom padding

        const offsetX = padding + Math.random() * Math.max(0, usableWidth - windowWidth);
        // Ensure offsetY is at least padding and respects usableHeight
        const offsetY = padding + Math.random() * Math.max(0, usableHeight - windowHeight);
        
        position = { x: Math.round(offsetX), y: Math.round(offsetY) };
        console.log("OPEN_WINDOW calculated initial position:", position, "Viewport H:", winH, "Taskbar H:", TASKBAR_HEIGHT, "Usable H for window area:", usableHeight);
      }
      const newWindow: Window = {
        ...action.payload,
        zIndex: highestZIndex + 1,
        position,
        size: action.payload.size || { width: 500, height: 400 },
        minimized: false,
        isMaximized: false,
      };
      return { ...state, windows: [...state.windows, newWindow], activeWindowId: newWindow.id };
    }
    case "CLOSE_WINDOW": {
      const newWindows = state.windows.filter(w => w.id !== action.payload.id);
      let newActiveWindowId = state.activeWindowId;
      if (state.activeWindowId === action.payload.id) {
        // Find the next highest z-index window that isn't minimized
        const potentialNextActive = newWindows
          .filter(w => !w.minimized)
          .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
        newActiveWindowId = potentialNextActive.length > 0 ? potentialNextActive[0].id : null;
      }
      return { ...state, windows: newWindows, activeWindowId: newActiveWindowId };
    }
    case "RESTORE_WINDOW": {
      // Brings window to front and ensures it's not minimized
      return desktopReducer(state, { type: 'FOCUS_WINDOW', payload: { id: action.payload.id } });
      // FOCUS_WINDOW already handles bringing to front and setting minimized: false
    }
    case "FOCUS_WINDOW": {
      const { id } = action.payload;
      if (state.activeWindowId === id) return state; // Already active

      const highestZIndex = Math.max(Z_INDEX.WINDOW_NORMAL, ...state.windows.map(w => w.zIndex || Z_INDEX.WINDOW_NORMAL));
      const newZIndex = highestZIndex + 1;

      return {
        ...state,
        activeWindowId: id,
        windows: state.windows.map(window => window.id === id
          ? { ...window, zIndex: newZIndex, minimized: false } // Bring to front and unminimize
          : window
        )
      };
    }
    case "MINIMIZE_WINDOW": {
      const targetWindow = state.windows.find(w => w.id === action.payload.id);
      if (!targetWindow || targetWindow.minimized) return state; // Already minimized or not found

      const newWindows = state.windows.map(w => w.id === action.payload.id ? { ...w, minimized: true } : w);
      let newActiveWindowId = state.activeWindowId;
      if (state.activeWindowId === action.payload.id) {
        const potentialNextActive = newWindows.filter(w => !w.minimized).sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
        newActiveWindowId = potentialNextActive.length > 0 ? potentialNextActive[0].id : null;
      }
      return { ...state, windows: newWindows, activeWindowId: newActiveWindowId };
    }
    case "UPDATE_WINDOW": { // Used for combined updates like maximize/restore
      const { id, position, size } = action.payload;
      return {
        ...state,
        windows: state.windows.map(window => window.id === id
          ? { ...window, position: position || window.position, size: size || window.size }
          : window
        )
      };
    }
    case "TOGGLE_START_MENU": {
      const newStartMenuOpen = action.payload?.startMenuOpen !== undefined ? action.payload.startMenuOpen : !state.startMenuOpen;
      if (newStartMenuOpen === state.startMenuOpen) return state;
      return { ...state, startMenuOpen: newStartMenuOpen };
    }
   case "CREATE_FOLDER": {
      const newFolder = action.payload; 
      const isDesktopItem = newFolder.parentId === null;
      let position = newFolder.position || { x: 50, y: 50 };

      if (isDesktopItem) {
        const savedPositions = loadDesktopItemPositions();
        position = savedPositions[newFolder.id] || position; // Use saved if available
        saveDesktopItemPositions(newFolder.id, {x: position.x, y: position.y}); // Save initial position if created on desktop
      }

      const newFolderItem: DesktopItem = {
        id: newFolder.id, 
        title: newFolder.title, 
        icon: newFolder.icon || "/assets/win98-icons/png/directory_closed-1.png",
        type: "folder", 
        position: position, 
        parentId: newFolder.parentId ?? null,
        path: newFolder.path, 
      };
      if (state.folders.some(f => f.id === newFolder.id) || state.desktopItems.some(i => i.id === newFolder.id)) {
        console.warn(`Create Folder: Duplicate ID ${newFolder.id}`); return state;
      }
      return { ...state, folders: [...state.folders, newFolder], desktopItems: [...state.desktopItems, newFolderItem] };
    }
    case "UPDATE_WINDOW_POSITION": { /* ... with tolerance check ... */
      const existingWindow = state.windows.find(w => w.id === action.payload.id);
      if (existingWindow && Math.abs(existingWindow.position.x - action.payload.position.x) < 1 && Math.abs(existingWindow.position.y - action.payload.position.y) < 1) return state;
      return { ...state, windows: state.windows.map(window => window.id === action.payload.id ? { ...window, position: action.payload.position } : window) };
    }
    case "UPDATE_WINDOW_SIZE": { /* ... with tolerance check ... */
      const existingWindow = state.windows.find(w => w.id === action.payload.id);
      if (existingWindow?.size && Math.abs(existingWindow.size.width - action.payload.size.width) < 1 && Math.abs(existingWindow.size.height - action.payload.size.height) < 1) return state;
      return { ...state, windows: state.windows.map(window => window.id === action.payload.id ? { ...window, size: action.payload.size } : window) };
    }
    case "UPDATE_ITEM_POSITION": {
      const { itemId, position } = action.payload;
      saveDesktopItemPositions(itemId, position); // Save to localStorage
      return {
        ...state,
        desktopItems: state.desktopItems.map(item =>
          item.id === itemId
            ? { ...item, position }
            : item
        ),
      };
    }
    case "BATCH_UPDATES": {
      return action.payload;
    }
    case "UPDATE_CLIPBOARD": {
      const { action: clipboardAction, files } = action.payload;
      let updatedDesktopItems = [...state.desktopItems];

      // Clear isCut for previously cut items if not pasting them now
      if (state.clipboard && state.clipboard.action === "cut") {
        const prevCutItemIds = state.clipboard.items.map(item => item.id);
        const newCutItemIds = files.map(file => file.id);
        prevCutItemIds.forEach(id => {
          if (!newCutItemIds.includes(id)) { // Item was cut, but not part of the new clipboard action
            const itemIndex = updatedDesktopItems.findIndex(item => item.id === id);
            if (itemIndex !== -1 && updatedDesktopItems[itemIndex].isCut) {
              updatedDesktopItems[itemIndex] = { ...updatedDesktopItems[itemIndex], isCut: false };
            }
          }
        });
      }

      const itemsToStore = files.map(file => {
        if ('type' in file) { // It's already a DesktopItem
          return file as DesktopItem;
        }
        const item = updatedDesktopItems.find(di => di.id === file.id);
        return item || null;
      }).filter(item => item !== null) as DesktopItem[];

      if (clipboardAction === "cut") {
        itemsToStore.forEach(itemToCut => {
          const itemIndex = updatedDesktopItems.findIndex(item => item.id === itemToCut.id);
          if (itemIndex !== -1) {
            updatedDesktopItems[itemIndex] = { ...updatedDesktopItems[itemIndex], isCut: true };
          }
        });
      }

      return {
        ...state,
        desktopItems: updatedDesktopItems,
        clipboard: {
          action: clipboardAction as "cut" | "copy",
          items: itemsToStore,
        },
      };
    }
    case "PASTE_ITEMS": {
      const { destinationId, position } = action.payload;
      if (!state.clipboard || !state.clipboard.items.length) {
        return state; // Nothing to paste
      }

      const { action: clipboardAction, items: clipboardItems } = state.clipboard;
      let newDesktopItems = [...state.desktopItems];
      const pastedItems: DesktopItem[] = [];

      // Prevent recursive drop: don't allow pasting a folder into itself or its descendants
      if (destinationId) {
        for (const item of clipboardItems) {
          if (item.type === 'folder' && (item.id === destinationId || isDescendant(state.desktopItems, item.id, destinationId))) {
            console.warn('Cannot paste a folder into itself or its descendant.');
            return state;
          }
        }
      }

      // Determine base position for pasting
      let rawBasePastePosition = position || { x: 50, y: 50 }; 

      // Offset for multiple items to avoid perfect overlap
      const PASTE_OFFSET_INCREMENT = 20; 

      clipboardItems.forEach((itemToPaste, index) => {
        const newItemId = `${itemToPaste.type}-${Date.now()}-${index}`; // Generate new ID for pasted item

        // Calculate position for the current item being pasted
        const currentItemPastePosition = {
          x: rawBasePastePosition.x + index * PASTE_OFFSET_INCREMENT,
          y: rawBasePastePosition.y + index * PASTE_OFFSET_INCREMENT,
        };

        const pastedItem: DesktopItem = {
          ...itemToPaste,
          id: clipboardAction === "cut" ? itemToPaste.id : newItemId, // Keep ID if cut, generate new if copy
          parentId: destinationId,
          position: currentItemPastePosition, // Apply calculated position
          isCut: false, // Always reset isCut on paste
        };
        pastedItems.push(pastedItem);

        if (clipboardAction === "cut") {
          // If cut, update the original item's parentId and position
          const originalItemIndex = newDesktopItems.findIndex(item => item.id === itemToPaste.id);
          if (originalItemIndex !== -1) {
            newDesktopItems[originalItemIndex] = { ...pastedItem }; // Update existing item
          }
        } else {
          // If copy, add as a new item
          newDesktopItems.push(pastedItem);
        }
      });
      
      // If the action was 'cut', the items are now "moved", so clear the clipboard.
      // For 'copy', the clipboard can remain as is for multiple pastes.
      const newClipboard = clipboardAction === "cut" ? null : state.clipboard;

      return {
        ...state,
        desktopItems: newDesktopItems,
        clipboard: newClipboard, // Clear clipboard if items were cut
      };
    }
    case "MOVE_ITEM": {
      const { itemId, newParentId, position, newPath } = action.payload;
      let updatedItems = state.desktopItems.map(item => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            parentId: newParentId,
            path: newPath !== undefined ? newPath : item.path, // Update path if provided
          };
          if (newParentId === null && position) { // Moved to desktop
            updatedItem.position = position;
            saveDesktopItemPositions(itemId, position);
          } else if (newParentId !== null) { // Moved into a folder
            // Remove from localStorage as its desktop position is no longer active
            removeDesktopItemPosition(itemId);
            // Position within folder is managed by FolderWindow layout, clear desktop one.
            // updatedItem.position = {x: 0, y: 0}; // Or some default relative position
          }
          return updatedItem;
        }
        return item;
      });

      // If an item is cut and then moved (pasted), clear its isCut status
      const clipboardItem = state.clipboard?.items.find(ci => ci.id === itemId);
      if (state.clipboard?.action === 'cut' && clipboardItem) {
          updatedItems = updatedItems.map(item => item.id === itemId ? {...item, isCut: false} : item);
      }
      
      // If the clipboard action was 'cut', clear the clipboard after paste/move
      const clearClipboard = state.clipboard?.action === 'cut';

      return {
        ...state,
        desktopItems: updatedItems,
        clipboard: clearClipboard ? null : state.clipboard,
      };
    }
    case "UPDATE_WINDOW_TITLE": {
      const { id, title } = action.payload;
      return {
        ...state,
        windows: state.windows.map(window =>
          window.id === id ? { ...window, title: title } : window
        ),
      };
    }
    case "DELETE_FOLDER":
    case "RENAME_FOLDER":
      // Implement these cases as needed
      return state;
    case "CREATE_ITEM": {
      const newItemPayload = action.payload;
      const isDesktopItem = newItemPayload.parentId === null;
      let position = newItemPayload.position || {x: 50, y: 50};

      if (isDesktopItem) {
        const savedPositions = loadDesktopItemPositions();
        position = savedPositions[newItemPayload.id] || position;
        if (position) { 
            saveDesktopItemPositions(newItemPayload.id, position);
        }
      }
       const newItem: DesktopItem = {
        id: newItemPayload.id,
        title: newItemPayload.title || 'New Item',
        type: newItemPayload.type,
        icon: newItemPayload.icon || getDefaultIcon(newItemPayload.type, newItemPayload.title || 'New Item'),
        parentId: newItemPayload.parentId,
        path: newItemPayload.path,
        position: position,
      };
      if (state.desktopItems.some(i => i.id === newItem.id)) {
         console.warn(`Create Item: Duplicate ID ${newItem.id}`); return state;
      }
      return { ...state, desktopItems: [...state.desktopItems, newItem] };
    }
    case "DELETE_ITEM": {
      const { id } = action.payload;
      // Also remove from localStorage if it was a desktop item
      const itemToDelete = state.desktopItems.find(item => item.id === id);
      if (itemToDelete && itemToDelete.parentId === null) {
        removeDesktopItemPosition(id);
      }
      return {
        ...state,
        desktopItems: state.desktopItems.filter(item => item.id !== id),
        folders: state.folders.filter(folder => folder.id !== id), // Also remove from folders list if it's a folder
        // Potentially clean up from clipboard as well
        clipboard: state.clipboard ? {
          ...state.clipboard,
          items: state.clipboard.items.filter(item => item.id !== id),
        } : null,
      };
    }
    default:
      // const exhaustiveCheck: never = action;
      return state;
  }
};

const initialState: DesktopState = {
  windows: [],
  activeWindowId: null,
  projects: portfolioProjects, // Initialize projects from portfolioData
  folders: [],
  // Initialize desktopItems based on initial projects
  desktopItems: portfolioProjects.map(
    (project, index): DesktopItem => {
      const padding = 16; // From _variables.scss: $spacing-md
      const gridCellWidth = 80; // DESKTOP_ICON_WIDTH
      const gridCellHeight = 90; // DESKTOP_ICON_HEIGHT
      const gridGap = 8; // From _variables.scss: $spacing-sm
      const itemsPerRow = 8;

      const columnIndex = index % itemsPerRow;
      const rowIndex = Math.floor(index / itemsPerRow);

      const x = padding + columnIndex * (gridCellWidth + gridGap);
      const y = padding + rowIndex * (gridCellHeight + gridGap);

      return {
        id: project.id,
        title: project.title,
        icon: project.icon || "/assets/win98-icons/png/directory_open_cool-1.png",
        type: project.type || "project",
        position: { x, y },
        parentId: project.parentId ?? null,
      };
    }
  ),
  startMenuOpen: false,
  clipboard: null, // Initialize clipboard
};


// Context Provider and Hook (remain the same)
interface DesktopContextType {
  state: DesktopState;
  dispatch: Dispatch<DesktopAction>; 
  batchActions: (actions: DesktopAction[]) => void;
}
const DesktopContext = createContext<DesktopContextType | undefined>(undefined); // Initialize with undefined
export const DesktopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(desktopReducer, initialState);
  const stateRef = useRef(state); // Ref to hold the latest state for batching

  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // *** FIX: Restore batchActions implementation ***
  const batchActions = useCallback((actions: DesktopAction[]) => {
    if (actions.length === 0) return;

    // Apply actions cumulatively to the latest state from the ref
    let intermediateState = stateRef.current;
    actions.forEach(action => {
      intermediateState = desktopReducer(intermediateState, action);
    });

    // Dispatch a single BATCH_UPDATES action with the final state
    dispatch({
      type: "BATCH_UPDATES",
      payload: intermediateState
    });
  }, [dispatch]); // Dependency is only dispatch

  return (
    <DesktopContext.Provider value={{ state, dispatch, batchActions }}>
      {children}
    </DesktopContext.Provider>
  );
};

// *** FIX: Add check for undefined context ***
export const useDesktop = (): DesktopContextType => {
  const context = useContext(DesktopContext);
  if (context === undefined) {
    throw new Error('useDesktop must be used within a DesktopProvider');
  }
  return context;
};