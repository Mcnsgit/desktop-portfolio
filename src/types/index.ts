// src/types/index.ts
import { StaticImageData } from "next/image";

// --- WINDOW TYPES ---
export interface Position {
  x: number;
  y: number;
}
export interface Size {
  width: number;
  height: number;
}

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
  | { type: string; [key: string]: any };

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

export interface newWindow {
  id: string;
  title: string;
  content: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: Position;
  size: Size;
  zIndex: number;
  type: string;
  data?: WindowContent;
}

// --- FILE SYSTEM TYPES ---
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

// --- FOLDER TYPE ---
export interface Folder {
  id: string;
  title: string;
  icon?: string;
  items?: string[];
  position?: Position;
  parentId?: string | null;
  path?: string;
}

export interface FileItemData {
  id: string;
  name: string;
  type:'file'|'folder'|'shortcut';
  fileType?: string;
  size?: string;
  modified?: string
}
// --- DESKTOP TYPES ---
export interface DesktopItem {
  id: string;
  title: string;
  icon?: string;
  type: "project" | "folder" | "shortcut" | string;
  onClick?: () => void;
  position: Position;
  parentId: string | null;
  zIndex?: number;
  isCut?: boolean;
  path?: string;
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
  | "CHANGE_WALLPAPER";

export interface DesktopAction {
  type: DesktopActionType;
  payload: any;
}
