// Updated DesktopContext with fixes for infinite update loops
import React, { createContext, useReducer, useContext, useRef } from "react";
import { Project, Window, Folder, FileSystemItem } from "../types";

type DesktopState = {
  windows: Window[];
  activeWindowId: string | null;
  projects: Project[];
  folders: Folder[];
  desktopItems: FileSystemItem[];
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
  | {
    type: "MOVE_ITEM";
    payload: {
      itemId: string;
      newParentId: string | null;
      position?: { x: number; y: number };
    };
  }
  | {
    type: "UPDATE_ITEM_POSITION";
    payload: { itemId: string; position: { x: number; y: number } };
  }
  | {
    type: "UPDATE_WINDOW_POSITION";
    payload: { id: string; position: { x: number; y: number } };
  }
  | {
    type: "UPDATE_WINDOW_SIZE";
    payload: { id: string; size: { width: number; height: number } };
  };

// Enhanced reducer with batching and position deduplication
const desktopReducer = (
  state: DesktopState,
  action: DesktopAction
): DesktopState => {
  // For debugging purposes in development environment
  if (process.env.NODE_ENV === 'development') {
    console.log(`DesktopContext - Action: ${action.type}`,
      action.type === 'UPDATE_WINDOW_POSITION' ?
        { id: action.payload.id, position: action.payload.position } :
        action.payload
    );
  }

  switch (action.type) {
    case "INIT_PROJECTS": {
      // Position projects in a grid by default
      const initialDesktopItems = action.payload.projects.map(
        (project, index) => ({
          id: project.id,
          title: project.title,
          icon: project.icon,
          type: "project" as const,
          position: {
            x: 20 + (index % 5) * 100,
            y: 20 + Math.floor(index / 5) * 120,
          },
          parentId: project.parentId ?? null,
        })
      );

      return {
        ...state,
        projects: action.payload.projects,
        desktopItems: initialDesktopItems,
      };
    }

    case "OPEN_WINDOW": {
      const existingWindow = state.windows.find(
        (w) => w.id === action.payload.id
      );

      // If window already exists, just un-minimize it
      if (existingWindow) {
        return {
          ...state,
          windows: state.windows.map((w) =>
            w.id === action.payload.id ? { ...w, minimized: false } : w
          ),
          activeWindowId: action.payload.id,
        };
      }

      // Otherwise create a new window with proper defaults
      const newWindow = {
        ...action.payload,
        position: action.payload.position || { x: 100, y: 100 },
        size: action.payload.size || { width: 500, height: 400 },
        minimized: false,
        type: action.payload.type || "default" as Window["type"]
      };

      return {
        ...state,
        windows: [...state.windows, newWindow],
        activeWindowId: action.payload.id,
      };
    }

    case "CLOSE_WINDOW": {
      const newWindows = state.windows.filter(
        (w) => w.id !== action.payload.id
      );

      // Update active window ID if needed
      const newActiveWindowId =
        state.activeWindowId === action.payload.id
          ? newWindows.length > 0
            ? newWindows[newWindows.length - 1].id
            : null
          : state.activeWindowId;

      return {
        ...state,
        windows: newWindows,
        activeWindowId: newActiveWindowId,
      };
    }

    case "RESTORE_WINDOW": { // Explicitly un-minimize window and focus it 
    const updatedWindows = state.windows.map((window) =>
       window.id === action.payload.id 
    ? { ...window, minimized: false } 
    : window 
  ); 
    
    return { ...state,
       windows: updatedWindows,
        activeWindowId: action.payload.id,
       };
       }
      let highestZIndex = Z_INDEX.WINDOW_NORMAL;

    case "FOCUS_WINDOW": {
      const { id } = action.payload;

      // If already active, no need to change anything
      if (state.activeWindowId === id) {
        return state;
      }

      // Increment the highest z-index for the newly focused window
      highestZIndex = Math.max(highestZIndex + 1, Z_INDEX.WINDOW_ACTIVE);

      return {
        ...state,
        activeWindowId: id,
        windows: state.windows.map(window => {
          if (window.id === id) {
            return {
              ...window,
              zIndex: highestZIndex, // Store z-index in the window object
              minimized: false // Automatically restore window if minimized
            };
          }
          return window;
        })
      };
    }

    case "MINIMIZE_WINDOW": {
      // Skip if already minimized
      const targetWindow = state.windows.find(w => w.id === action.payload.id);
      if (targetWindow && targetWindow.minimized) {
        return state;
      }

      // Mark window as minimized
      const newWindows = state.windows.map((w) =>
        w.id === action.payload.id ? { ...w, minimized: true } : w
      );

      // Find next window to focus if the active window was minimized
      const newActiveWindowId =
        state.activeWindowId === action.payload.id
          ? newWindows.find((w) => w.id !== action.payload.id && !w.minimized)
            ?.id || null
          : state.activeWindowId;

      return {
        ...state,
        windows: newWindows,
        activeWindowId: newActiveWindowId,
      };
    }
    case "UPDATE_WINDOW":
      const { id, position, size } = action.payload;
      return {
        ...state,
        windows: state.windows.map(window =>
          window.id === id
            ? {
              ...window,
              position: position || window.position,
              size: size || window.size
            }
            : window
        )
      };
    case "TOGGLE_START_MENU": {
      const newStartMenuOpen =
        action.payload?.startMenuOpen !== undefined
          ? action.payload.startMenuOpen
          : !state.startMenuOpen;

      // Skip update if no change
      if (newStartMenuOpen === state.startMenuOpen) {
        return state;
      }

      return {
        ...state,
        startMenuOpen: newStartMenuOpen,
      };
    }

    case "CREATE_FOLDER": {
      const newFolderItem: FileSystemItem = {
        id: action.payload.id,
        title: action.payload.title,
        icon: action.payload.icon,
        type: "folder",
        position: action.payload.position,
        parentId: action.payload.parentId ?? null,
      };

      return {
        ...state,
        folders: [...state.folders, action.payload],
        desktopItems: [...state.desktopItems, newFolderItem],
      };
    }

    case "UPDATE_WINDOW_POSITION": {
      // Skip if the position is the same
      const existingWindow = state.windows.find(w => w.id === action.payload.id);
      if (existingWindow &&
        existingWindow.position.x === action.payload.position.x &&
        existingWindow.position.y === action.payload.position.y) {
        return state;
      }

      // Update the window position
      return {
        ...state,
        windows: state.windows.map((window) =>
          window.id === action.payload.id
            ? { ...window, position: action.payload.position }
            : window
        ),
      };
    }

    case "UPDATE_WINDOW_SIZE": {
      // Skip if the size is the same
      const existingWindow = state.windows.find(w => w.id === action.payload.id);
      if (existingWindow &&
        existingWindow.size?.width === action.payload.size.width &&
        existingWindow.size?.height === action.payload.size.height) {
        return state;
      }

      // Update the window size
      return {
        ...state,
        windows: state.windows.map((window) =>
          window.id === action.payload.id
            ? { ...window, size: action.payload.size }
            : window
        ),
      };
    }

    case "UPDATE_ITEM_POSITION": {
      // Skip if the position is the same
      const existingItem = state.desktopItems.find(
        item => item.id === action.payload.itemId
      );

      if (existingItem &&
        existingItem.position.x === action.payload.position.x &&
        existingItem.position.y === action.payload.position.y) {
        return state;
      }

      // Update the item position
      return {
        ...state,
        desktopItems: state.desktopItems.map((item) =>
          item.id === action.payload.itemId
            ? { ...item, position: action.payload.position }
            : item
        ),
      };
    }

    case "MOVE_ITEM":
    case "DELETE_FOLDER":
    case "RENAME_FOLDER":
      // Implement these cases as needed
      return state;

    default:
      return state;
  }
};

const initialState: DesktopState = {
  windows: [],
  activeWindowId: null,
  projects: [],
  folders: [],
  desktopItems: [],
  startMenuOpen: false,
};

// Create context with additional methods for batching
interface DesktopContextType {
  state: DesktopState;
  dispatch: React.Dispatch<DesktopAction>;
  batchActions: (actions: DesktopAction[]) => void;
}

const DesktopContext = createContext<DesktopContextType>({
  state: initialState,
  dispatch: () => null,
  batchActions: () => null,
});

export const DesktopProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(desktopReducer, initialState);
  const isBatching = useRef(false);
  const pendingActions = useRef<DesktopAction[]>([]);

  // Method to batch multiple actions together
  const batchActions = (actions: DesktopAction[]) => {
    if (actions.length === 0) return;

    // If already batching, just add to pending actions
    if (isBatching.current) {
      pendingActions.current.push(...actions);
      return;
    }

    // Start batch
    isBatching.current = true;

    // Process each action
    let currentState = state;
    actions.forEach(action => {
      currentState = desktopReducer(currentState, action);
    });

    // Dispatch a single synthesized update
    dispatch({
      type: "BATCH_UPDATES" as any,
      payload: currentState
    });

    // End batch
    isBatching.current = false;
    pendingActions.current = [];
  };

  return (
    <DesktopContext.Provider value={{ state, dispatch, batchActions }}>
      {children}
    </DesktopContext.Provider>
  );
};

export const useDesktop = () => useContext(DesktopContext);