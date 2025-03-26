import React, { createContext, useReducer, useContext } from "react";
import { Project, Window, Folder, DesktopItem } from "../types";
type DesktopState = {
  windows: Window[];
  activeWindowId: string | null;
  projects: Project[];
  folders: Folder[];
  desktopItems: DesktopItem[];
  startMenuOpen: boolean;
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
  // New action for window position updates
  | {
      type: "UPDATE_WINDOW_POSITION";
      payload: { id: string; position: { x: number; y: number } };
    }
  // New action for window size updates
  | {
      type: "UPDATE_WINDOW_SIZE";
      payload: { id: string; size: { width: number; height: number } };
    };
const desktopReducerWithLogging = (
  state: DesktopState,
  action: DesktopAction
): DesktopState => {
  console.log(`DesktopContext - Action dispatched: ${action.type}`, action.payload);

  const newState = desktopReducer(state, action);

  // Log state changes for debugging
  console.log(`DesktopContext - New state after ${action.type}:`, {
    windowCount: newState.windows.length,
    activeWindow: newState.activeWindowId,
    startMenuOpen: newState.startMenuOpen
  });

  return newState;
};
const desktopReducer = (
  state: DesktopState,
  action: DesktopAction
): DesktopState => {
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

      let newWindows;
      if (existingWindow) {
        console.log(`Window ${action.payload.id} already exists, un-minimizing it`)
        newWindows = state.windows.map((w) =>
            w.id === action.payload.id ? { ...w, minimized: false } : w
          );
        }else {
          console.log(`Creating new window: ${action.payload.id}`);
        // Ensure window has all required properties
        const newWindow = {
          ...action.payload,
          // Add default values for any missing properties
          position: action.payload.position || { x: 100, y: 100 },
          size: action.payload.size || { width: 500, height: 400 },
          minimized: false,
          type: (action.payload.type as Window["type"]) || "default" as Window["type"]
        };
        newWindows = [...state.windows, newWindow];
      }

      // Debug what we're returning
      console.log(`After OPEN_WINDOW for ${action.payload.id}:`, {
        windowCount: newWindows.length,
        newActiveId: action.payload.id,
        windows: newWindows.map(w => w.id)
      });

      return {
        ...state,
        windows: newWindows,
        activeWindowId: action.payload.id,
      };
    }
    case "CLOSE_WINDOW": {
      const newWindows = state.windows.filter(
        (w) => w.id !== action.payload.id
      );

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
    case "RESTORE_WINDOW": {
      // Explicitly un-minimize window and focus it
      const updatedWindows = state.windows.map((window) =>
        window.id === action.payload.id
          ? { ...window, minimized: false }
          : window
      );

      // Log for debugging
      console.log(`RESTORE_WINDOW action for ${action.payload.id}`, {
        beforeCount: state.windows.length,
        afterCount: updatedWindows.length,
        wasMinimized: state.windows.find((w) => w.id === action.payload.id)
          ?.minimized,
        isNowMinimized: updatedWindows.find((w) => w.id === action.payload.id)
          ?.minimized,
      });

      return {
        ...state,
        windows: updatedWindows,
        activeWindowId: action.payload.id,
      };
    }

    case "FOCUS_WINDOW": {
      // When focusing a window, ensure it's not minimized
      const newWindows = state.windows.map((w) =>
        w.id === action.payload.id ? { ...w, minimized: false } : w
      );

      return {
        ...state,
        activeWindowId: action.payload.id,
        windows: newWindows,
      };
    }

    case "MINIMIZE_WINDOW": {
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

    case "TOGGLE_START_MENU": {
      return {
        ...state,
        startMenuOpen:
          action.payload?.startMenuOpen !== undefined
            ? action.payload.startMenuOpen
            : !state.startMenuOpen,
      };
    }

    case "CREATE_FOLDER": {
      const newFolderItem: DesktopItem = {
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

    case "DELETE_FOLDER": {
      const folderToDelete = state.folders.find(
        (f) => f.id === action.payload.id
      );

      if (!folderToDelete) return state;

      const updatedDesktopItems = state.desktopItems
        .map((item) =>
          item.parentId === folderToDelete.id
            ? { ...item, parentId: folderToDelete.parentId || null }
            : item
        )
        .filter((item) => item.id !== folderToDelete.id);

      const updatedProjects = state.projects.map((project) =>
        project.parentId === folderToDelete.id
          ? { ...project, parentId: folderToDelete.parentId || undefined }
          : project
      );

      return {
        ...state,
        folders: state.folders.filter((f) => f.id !== action.payload.id),
        desktopItems: updatedDesktopItems,
        projects: updatedProjects,
      };
    }

    case "RENAME_FOLDER": {
      const renamedFolder = state.folders.map((folder) =>
        folder.id === action.payload.id
          ? { ...folder, title: action.payload.title }
          : folder
      );

      const renamedItems = state.desktopItems.map((item) =>
        item.id === action.payload.id && item.type === "folder"
          ? { ...item, title: action.payload.title }
          : item
      );

      return {
        ...state,
        folders: renamedFolder,
        desktopItems: renamedItems,
      };
    }

    case "MOVE_ITEM": {
      const { itemId, newParentId, position } = action.payload;
      const isFolder = state.folders.some((f) => f.id === itemId);
      const isProject = state.projects.some((p) => p.id === itemId);

      if (!isFolder && !isProject) return state;

      const updatedDesktopItems = state.desktopItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              parentId: newParentId || null,
              position: position || item.position,
            }
          : item
      );

      const updatedProjects = isProject
        ? state.projects.map((project) =>
            project.id === itemId
              ? { ...project, parentId: newParentId || null }
              : project
          )
        : state.projects;

      const updatedFolders = isFolder
        ? state.folders.map((folder) =>
            folder.id === itemId
              ? { ...folder, parentId: newParentId || null }
              : folder
          )
        : state.folders;

      return {
        ...state,
        desktopItems: updatedDesktopItems,
        projects: updatedProjects,
        folders: updatedFolders,
      };
    }

    case "UPDATE_ITEM_POSITION": {
      // Update position of a desktop item
      return {
        ...state,
        desktopItems: state.desktopItems.map((item) =>
          item.id === action.payload.itemId
            ? { ...item, position: action.payload.position }
            : item
        ),
      };
    }

    case "UPDATE_WINDOW_POSITION": {
      // New reducer case for window position updates
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
      // New reducer case for window size updates
      return {
        ...state,
        windows: state.windows.map((window) =>
          window.id === action.payload.id
            ? { ...window, size: action.payload.size }
            : window
        ),
      };
    }

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

const DesktopContext = createContext<{
  state: DesktopState;
  dispatch: React.Dispatch<DesktopAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const DesktopProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(desktopReducerWithLogging, initialState);

  return (
    <DesktopContext.Provider value={{ state, dispatch }}>
      {children}
    </DesktopContext.Provider>
  );
};

export const useDesktop = () => useContext(DesktopContext);
