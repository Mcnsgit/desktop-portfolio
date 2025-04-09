// --- WINDOW TYPES ---

/**
 * Position coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size dimensions
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Window content types
 */
export interface TextEditorContent {
  type: "texteditor";
  filePath?: string;
  content?: string;
}

export interface FileExplorerContent {
  type: "fileexplorer";
  initialPath?: string;
}

export interface ImageViewerContent {
  type: "imageviewer";
  filePath: string;
}

export interface ProjectContent {
  type: "project";
  projectId: string;
}

export interface FolderContent {
  type: "folder";
  folderId: string;
}

export interface WeatherAppContent {
  type: "weatherapp";
}

export type WindowContent =
  | TextEditorContent
  | FileExplorerContent
  | ImageViewerContent
  | ProjectContent
  | FolderContent
  | WeatherAppContent
  | { type: string; [key: string]: any };

/**
 * Window object
 */
export interface Window {
  id: string;
  title: string;
  content: WindowContent;
  position: Position;
  size: Size;
  minimized: boolean;
  type: string;
  zIndex?: number;
  isActive?: boolean;
  isMaximized?: boolean;
  isMinimized?: boolean;
  isClosed?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  isFullScreen?: boolean;
}

/**
 * Window options for creation
 */
export interface WindowOptions {
  id?: string;
  title?: string;
  content?: WindowContent | any;
  position?: Position;
  size?: Size;
  minimized?: boolean;
  type?: string;
}

// --- FILE SYSTEM TYPES ---

/**
 * File system item
 */
export interface FileSystemItem {
  name: string;
  isDirectory: boolean;
  isLink: boolean;
  linkTarget?: string;
  path: string;
  size?: number;
  modifiedDate?: Date;
}

// --- PROJECT TYPES ---

/**
 * Project details
 */
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image?: string;
  sourceUrl?: string;
  demoUrl?: string;
  details?: string;
  icon?: string;
  parentId?: string | null;
}

/**
 * Folder details
 */
export interface Folder {
  id: string;
  title: string;
  icon?: string;
  items?: string[]; // File paths or item IDs
  position?: { x: number; y: number }; // Added position property
  parentId?: string | null; // Added parentId property
}

// --- DESKTOP CONTEXT TYPES ---

/**
 * Desktop state
 */
export interface DesktopItem {
  id: string;
  title: string;
  icon?: string;
  type: "project" | "folder" | "shortcut" | string;
  position: Position;
  parentId: string | null;
  zIndex?: number;
}

export interface DesktopState {
  windows: Window[];
  activeWindowId: string | null;
  projects: Project[];
  folders: Folder[];
  desktopItems: DesktopItem[];
  startMenuOpen: boolean;
  theme?: string;
  wallpaper?: string;
  path?: string;
}

/**
 * Desktop action types
 */
export type DesktopActionType =
  | "OPEN_WINDOW"
  | "CLOSE_WINDOW"
  | "MINIMIZE_WINDOW"
  | "FOCUS_WINDOW"
  | "UPDATE_WINDOW_POSITION"
  | "UPDATE_WINDOW_SIZE"
  | "UPDATE_WINDOW" // New action for batched updates
  | "CHANGE_THEME"
  | "CHANGE_WALLPAPER";

/**
 * Desktop actions
 */
export interface DesktopAction {
  type: DesktopActionType;
  payload: any;
}
