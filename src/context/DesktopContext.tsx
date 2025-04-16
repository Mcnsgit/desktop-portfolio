// Updated DesktopContext with fixes for infinite update loops
import React, { createContext, useReducer, useContext, useRef, Dispatch, useCallback, useEffect } from "react";
import { Project, Window, Folder, DesktopItem } from "../types";
import { Z_INDEX } from "../utils/constants/windowConstants";
import { portfolioProjects } from '../data/portfolioData'

type DesktopState = {
  windows: Window[];
  activeWindowId: string | null;
  projects: Project[];
  folders: Folder[];
  desktopItems: DesktopItem[];
  startMenuOpen: boolean;
  path?: string;

};


export type DesktopAction =
  | { type: "OPEN_WINDOW"; payload: Window }
  | { type: "CLOSE_WINDOW"; payload: { id: string } }
  | { type: "FOCUS_WINDOW"; payload: { id: string } }
  | { type: "MINIMIZE_WINDOW"; payload: { id: string } }
  | { type: "TOGGLE_START_MENU"; payload?: { startMenuOpen?: boolean } }
  | { type: "INIT_PROJECTS"; payload: { projects: Project[] } }
  | { type: "CREATE_FOLDER"; payload: Folder }
  | { type: "DELETE_FOLDER"; payload: { id: string } }
  | { type: "RENAME_FOLDER"; payload: { id: string; title: string } }
  | { type: "RESTORE_WINDOW"; payload: { id: string } }
  | { type: "UPDATE_WINDOW"; payload: { id: string; position?: { x: number; y: number }; size?: { width: number; height: number } } }
  | { type: "BATCH_UPDATES"; payload: DesktopState }
  | { type: "MOVE_ITEM"; payload: { itemId: string; newParentId: string | null; position?: { x: number; y: number }; } }
  | { type: "UPDATE_ITEM_POSITION"; payload: { itemId: string; position: { x: number; y: number } }}
  | { type: "UPDATE_WINDOW_POSITION"; payload: { id: string; position: { x: number; y: number } } }
  | { type: "UPDATE_WINDOW_SIZE"; payload: { id: string; size: { width: number; height: number } };
  };


const desktopReducer = (state: DesktopState, action: DesktopAction): DesktopState => {
  // Debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`DesktopContext Reducer - Action: ${action.type}`, (action as any).payload);
  }

  switch (action.type) {
    case "INIT_PROJECTS": {
      const initialDesktopItems = action.payload.projects.map(
        (project, index): DesktopItem => ({
          id: project.id,
          title: project.title,
          icon: project.icon || "/assets/win98-icons/png/application-0.png", 
          type: "project", // Type is 'project'
          position: {
            x: 20 + (index % 8) * 90, // Adjust grid calculation if needed
            y: 20 + Math.floor(index / 8) * 100,
          },
          parentId: project.parentId ?? null,
        })
      );
      return {...state, projects: action.payload.projects, desktopItems: initialDesktopItems, folders: []};
    }
    case "OPEN_WINDOW": {
      const existingWindow = state.windows.find(w => w.id === action.payload.id);
      if (existingWindow) {
        // If window exists but is minimized, restore and focus
        if (existingWindow.minimized) {
          return desktopReducer(state, { type: 'RESTORE_WINDOW', payload: { id: action.payload.id } });
        }
        // If window exists and is not minimized, just focus
        return desktopReducer(state, { type: 'FOCUS_WINDOW', payload: { id: action.payload.id } });
      }
      const highestZIndex = Math.max(Z_INDEX.WINDOW_NORMAL, ...state.windows.map(w => w.zIndex || Z_INDEX.WINDOW_NORMAL));
      const newWindow: Window = { // Ensure payload matches Window type
        ...action.payload,
        zIndex: highestZIndex + 1,
        position: action.payload.position || { x: 100, y: 100 },
        size: action.payload.size || { width: 500, height: 400 },
        minimized: false, // Ensure new windows aren't minimized
        isMaximized: false, // Ensure new windows aren't maximized
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
      const newFolderItem: DesktopItem = {
        id: newFolder.id, title: newFolder.title, icon: newFolder.icon || "/assets/win98-icons/png/directory_closed-1.png",
        type: "folder", position: newFolder.position || { x: 50, y: 50 }, parentId: newFolder.parentId ?? null,
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
    case "UPDATE_ITEM_POSITION": { /* ... with tolerance check ... */
      const existingItem = state.desktopItems.find(item => item.id === action.payload.itemId);
      if (existingItem && Math.abs(existingItem.position.x - action.payload.position.x) < 1 && Math.abs(existingItem.position.y - action.payload.position.y) < 1) return state;
      return { ...state, desktopItems: state.desktopItems.map(item => item.id === action.payload.itemId ? { ...item, position: action.payload.position } : item) };
    }
    case "BATCH_UPDATES": {
      return action.payload;
    }

    case "MOVE_ITEM":
    case "DELETE_FOLDER":
    case "RENAME_FOLDER":
      // Implement these cases as needed
      return state;

    default:
      const _: never = action; // This line will error if any action type isn't handled
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
    (project, index): DesktopItem => ({
      id: project.id,
      title: project.title,
      icon: project.icon || "/assets/win98-icons/png/application-0.png",
      type: "project",
      position: {
        x: 20 + (index % 8) * 90,
        y: 20 + Math.floor(index / 8) * 100,
      },
      parentId: project.parentId ?? null,
    })
  ),
  startMenuOpen: false,
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