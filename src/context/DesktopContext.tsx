import React, { createContext, useReducer, useContext } from "react";
import { Project, Window, Folder, DesktopItem } from '../types';
type DesktopState = {
  windows: Window[];
  activeWindowId: string | null;
  projects: Project[];
  folders: Folder[];
  desktopItems: DesktopItem[];
  startMenuOpen: boolean;
};
type DesktopAction =
  | { type: 'OPEN_WINDOW'; payload: Window }
  | { type: 'CLOSE_WINDOW'; payload: { id: string } }
  | { type: 'FOCUS_WINDOW'; payload: { id: string } }
  | { type: 'MINIMIZE_WINDOW'; payload: { id: string } }
  | { type: 'TOGGLE_START_MENU'; payload?: { startMenuOpen?: boolean } }
  | { type: 'INIT_PROJECTS'; payload: { projects: Project[] } }
  | { type: 'CREATE_FOLDER'; payload: Folder }
  | { type: 'DELETE_FOLDER'; payload: { id: string } }
  | { type: 'RENAME_FOLDER'; payload: { id: string; title: string } }
  | { type: 'MOVE_ITEM'; payload: { itemId: string; newParentId: string | null; position?: { x: number; y: number } } }
  | { type: 'UPDATE_ITEM_POSITION'; payload: { itemId: string; position: { x: number; y: number } } };
const desktopReducer = (state: DesktopState, action: DesktopAction): DesktopState => {
  switch (action.type) {
    case 'INIT_PROJECTS': {
      const initialDesktopItems = action.payload.projects.map((project) => ({
        id: project.id,
        title: project.title,
        icon: project.icon,
        type: 'project' as const,
        position: { x: 20, y: 20 },
        parentId: project.parentId ?? null
      }));
      return {
        ...state,
        projects: action.payload.projects,
        desktopItems: initialDesktopItems || null
      };
    }
    case 'OPEN_WINDOW': {
      const existingWindow = state.windows.find(w => w.id === action.payload.id);
      const newWindows = existingWindow ? state.windows.map(w =>
        w.id === action.payload.id ? { ...w, minimized: false } : w
      ) : [...state.windows, action.payload];
      return {
        ...state,
        windows: newWindows,
        activeWindowId: action.payload.id
      };
    }
    case 'CLOSE_WINDOW': {
      const newWindows = state.windows.filter(w => w.id !== action.payload.id);
      const newActiveWindowId = state.activeWindowId === action.payload.id
        ? newWindows.length > 0 ? newWindows[newWindows.length - 1].id : null
        : state.activeWindowId;
      return {
        ...state,
        windows: newWindows,
        activeWindowId: newActiveWindowId
      };
    }
    case 'FOCUS_WINDOW': {
      const newWindows = state.windows.map(w =>
        w.id === action.payload.id ? { ...w, minimized: false } : w
      );
      return {
        ...state,
        activeWindowId: action.payload.id,
        windows: newWindows
      };
    }
    case 'MINIMIZE_WINDOW': {
      const newWindows = state.windows.map(w =>
        w.id === action.payload.id ? { ...w, minimized: true } : w
      );
      const newActiveWindowId = state.activeWindowId === action.payload.id
        ? newWindows.find(w => w.id !== action.payload.id && !w.minimized)?.id || null
        : state.activeWindowId;
      return {
        ...state,
        windows: newWindows,
        activeWindowId: newActiveWindowId
      };
    }
    case 'TOGGLE_START_MENU': {
      return {
        ...state,
        startMenuOpen: action.payload?.startMenuOpen !== undefined
          ? action.payload.startMenuOpen
          : !state.startMenuOpen
      };
    }
    case 'CREATE_FOLDER': {
      const newFolderItem: DesktopItem = {
        id: action.payload.id,
        title: action.payload.title,
        icon: action.payload.icon,
        type: 'folder',
        position: action.payload.position,
        parentId: action.payload.parentId ?? null
      };
      return {
        ...state,
        folders: [...state.folders, action.payload],
        desktopItems: [...state.desktopItems, newFolderItem]
      };
    }
    case 'DELETE_FOLDER': {
      const folderToDelete = state.folders.find(f => f.id === action.payload.id);
      if (!folderToDelete) return state;
      const updatedDesktopItems = state.desktopItems.map(item =>
        item.parentId === folderToDelete.id
          ? { ...item, parentId: folderToDelete.parentId || null }
          : item
      ).filter(item => item.id !== folderToDelete.id);
      const updatedProjects = state.projects.map(project =>
        project.parentId === folderToDelete.id
          ? { ...project, parentId: folderToDelete.parentId || undefined }
          : project
      );
      return {
        ...state,
        folders: state.folders.filter(f => f.id !== action.payload.id),
        desktopItems: updatedDesktopItems,
        projects: updatedProjects
      };
    }
    case 'RENAME_FOLDER': {
      const renamedFolder = state.folders.map(folder =>
        folder.id === action.payload.id ? { ...folder, title: action.payload.title } : folder
      );
      const renamedItems = state.desktopItems.map(item =>
        item.id === action.payload.id && item.type === 'folder'
          ? { ...item, title: action.payload.title }
          : item
      );
      return {
        ...state,
        folders: renamedFolder,
        desktopItems: renamedItems
      };
    }
    case 'MOVE_ITEM': {
      const { itemId, newParentId, position } = action.payload;
      const isFolder = state.folders.some(f => f.id === itemId);
      const isProject = state.projects.some(p => p.id === itemId);
      if (!isFolder && !isProject) return state;
      const updatedDesktopItems = state.desktopItems.map(item =>
        item.id === itemId
          ? { ...item, parentId: newParentId || null, position: position || item.position }
          : item
      );
      const updatedProjects = isProject
        ? state.projects.map(project =>
          project.id === itemId
            ? { ...project, parentId: newParentId || null }
            : project
        )
        : state.projects;
      const updatedFolders = isFolder
        ? state.folders.map(folder =>
          folder.id === itemId
            ? { ...folder, parentId: newParentId || null }
            : folder
        )
        : state.folders;
      return {
        ...state,
        desktopItems: updatedDesktopItems,
        projects: updatedProjects,
        folders: updatedFolders
      };
    }
    case 'UPDATE_ITEM_POSITION': {
      return {
        ...state,
        desktopItems: state.desktopItems.map(item =>
          item.id === action.payload.itemId
            ? { ...item, position: action.payload.position }
            : item
        )
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
export const DesktopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(desktopReducer, initialState);
  return (
    <DesktopContext.Provider value={{ state, dispatch }}>
      {children}
    </DesktopContext.Provider>
  );
};
export const useDesktop = () => useContext(DesktopContext);