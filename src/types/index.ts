// src/types/index.ts
import { StaticImageData } from "next/image";

// --- Core Interfaces ---
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// --- Window Content Types ---
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

export interface AboutContent {
  type: "about";
}

export interface SkillsContent {
  type: "skills";
}

export interface ContactContent {
  type: "contact";
}

export interface EducationContent {
  type: "education";
}

export interface BrowserContent {
  type: "browser";
  url?: string;
}

export interface SettingsContent {
  type: "settings";
}

export interface TodoListContent {
  type: "todolist";
}

export type WindowContent =
  | TextEditorContent
  | FileExplorerContent
  | ImageViewerContent
  | ProjectContent
  | FolderContent
  | WeatherAppContent
  | AboutContent
  | SkillsContent
  | ContactContent
  | EducationContent
  | BrowserContent
  | SettingsContent
  | TodoListContent
  | { type: string; [key: string]: any };

// --- Main Window Interface (single source of truth) ---
export interface Window {
  id: string;
  title: string;
  content: WindowContent;
  position: Position;
  size: Size;
  minimized: boolean;
  type: string;
  zIndex?: number;
  isMaximized?: boolean;
}

// --- File System Types ---
export interface FileSystemItem {
  name: string;
  isDirectory: boolean;
  isLink: boolean;
  linkTarget?: string;
  path: string;
  size?: number;
  modifiedDate?: Date;
}

export interface FileItemData {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'shortcut';
  fileType?: string;
  size?: string;
  modified?: string;
}

// --- Project Types ---
export interface ProjectTag {
  name: string;
  color: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  name: string;
  tags: ProjectTag[];
  image: string | StaticImageData;
  source_code_link?: string;
  live_link?: string;
  icon?: string;
  technologies?: string[];
  repoUrl?: string;
  demoUrl?: string;
  content?: string;
  details?: string;
  parentId?: string | null;
  type?: "code" | "interactive" | "visual" | string;
  path?: string;
}

// --- Folder Types ---
export interface Folder {
  id: string;
  title: string;
  icon?: string;
  items?: string[];
  position?: Position;
  parentId?: string | null;
  path?: string;
}

// --- Desktop Item Types ---
export interface DesktopItem {
  id: string;
  title: string;
  icon?: string;
  type: "project" | "folder" | "shortcut" | "file" | string;
  onClick?: () => void;
  position: Position;
  parentId: string | null;
  zIndex?: number;
  isCut?: boolean;
  path?: string;
}

// --- Desktop State ---
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
  clipboard: {
    action: "cut" | "copy" | null;
    items: DesktopItem[];
  } | null;
}

// --- Complete Desktop Action Types (exhaustive) ---
export type DesktopActionType =
  | "OPEN_WINDOW"
  | "CLOSE_WINDOW"
  | "MINIMIZE_WINDOW"
  | "FOCUS_WINDOW"
  | "UPDATE_WINDOW_POSITION"
  | "UPDATE_WINDOW_SIZE"
  | "UPDATE_WINDOW"
  | "RESTORE_WINDOW"
  | "TOGGLE_START_MENU"
  | "INIT_PROJECTS"
  | "CREATE_FOLDER"
  | "DELETE_FOLDER"
  | "RENAME_FOLDER"
  | "UPDATE_ITEM_POSITION"
  | "MOVE_ITEM"
  | "BATCH_UPDATES"
  | "CHANGE_THEME"
  | "CHANGE_WALLPAPER"
  | "CYCLE_BACKGROUND"
  | "CREATE_ITEM"
  | "DELETE_ITEM"
  | "RENAME_ITEM"
  | "ADD_TO_FAVORITES"
  | "UPDATE_CLIPBOARD"
  | "PASTE_ITEMS"
  | "UPDATE_WINDOW_TITLE";

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
  | { type: "MOVE_ITEM"; payload: { itemId: string; newParentId: string | null; position?: { x: number; y: number }; newPath?: string; } }
  | { type: "UPDATE_ITEM_POSITION"; payload: { itemId: string; position: { x: number; y: number } }}
  | { type: "UPDATE_WINDOW_POSITION"; payload: { id: string; position: { x: number; y: number } } }
  | { type: "UPDATE_WINDOW_SIZE"; payload: { id: string; size: { width: number; height: number } } }
  | { type: "CYCLE_BACKGROUND"; payload?: any }
  | { type: "CREATE_ITEM"; payload: { id: string, title?: string, type: string, icon: string, parentId: string | null, path?: string, position?: {x: number, y: number} } }
  | { type: "DELETE_ITEM"; payload: { id: string } }
  | { type: "RENAME_ITEM"; payload: { id: string, title: string} }
  | { type: "ADD_TO_FAVORITES"; payload: {id: string}}
  | { type: "UPDATE_CLIPBOARD"; payload: { action: string; files: (DesktopItem | { id: string })[] } }
  | { type: "PASTE_ITEMS"; payload: { destinationId: string | null; position?: { x: number; y: number }; items: DesktopItem[] } }
  | { type: "UPDATE_WINDOW_TITLE"; payload: { id: string; title: string } };
