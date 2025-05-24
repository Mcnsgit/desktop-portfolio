// src/utils/windowServices/windowFactory.ts
import { WindowContent, Window } from "../../types";
import { WINDOW_TYPES, Z_INDEX } from "../constants";
import windowPositionService from "./WindowPositionService";

export interface LaunchOptions {
  // Common options
  title?: string;
  size?: { width: number; height: number };
  position?: { x: number; y: number };
  
  // Content-specific options
  filePath?: string;
  initialPath?: string;
  projectId?: string;
  folderId?: string;
  initialUrl?: string;
  content?: string;
  
  // Window options
  maximized?: boolean;
  minimized?: boolean;
}

/**
 * Create a window with specified type and options
 * @param type Window type (texteditor, fileexplorer, etc.)
 * @param options Launch configuration options
 * @returns Window object ready to dispatch
 */
export function createWindow(
  type: string,
  options: LaunchOptions = {}
): Window {
  // Generate a unique ID
  const id = `${type}-${Date.now()}`;
  
  // Get default size for this window type
  const defaultSize = windowPositionService.getDefaultWindowSize(type);
  
  // Set position with cascading effect if not specified
  const position = options.position || 
    windowPositionService.calculateWindowPosition(type, []);
  
  // Ensure position is valid (window will be visible)
  const size = options.size || defaultSize;
  const validPosition = windowPositionService.ensureWindowVisibility(
    position,
    size
  );

  // Create window content based on type and options
  const content = createWindowContent(type, options);
  
  // Get default title if not provided
  const title = options.title || getDefaultTitle(type, options);

  // Create the window object
  return {
    id,
    title,
    content,
    position: validPosition,
    size,
    minimized: options.minimized || false,
    type,
    zIndex: Z_INDEX.WINDOW_NORMAL,
    isMaximized: options.maximized || false,
  };
}

/**
 * Create window content based on type and options
 */
function createWindowContent(type: string, options: LaunchOptions): WindowContent {
  switch (type) {
    case WINDOW_TYPES.TEXT_EDITOR:
      return {
        type: "texteditor",
        filePath: options.filePath,
        content: options.content,
      };
      
    case WINDOW_TYPES.FILE_EXPLORER:
      return {
        type: "fileexplorer",
        initialPath: options.initialPath || "/home/guest/Desktop",
      };
      
    case WINDOW_TYPES.IMAGE_VIEWER:
      if (!options.filePath) {
        throw new Error("Image viewer requires filePath");
      }
      return {
        type: "imageviewer",
        filePath: options.filePath,
      };
      
    case WINDOW_TYPES.PROJECT:
      if (!options.projectId) {
        throw new Error("Project window requires projectId");
      }
      return {
        type: "project",
        projectId: options.projectId,
      };
      
    case WINDOW_TYPES.FOLDER:
      if (!options.folderId) {
        throw new Error("Folder window requires folderId");
      }
      return {
        type: "folder",
        folderId: options.folderId,
      };
      
    case WINDOW_TYPES.WEATHER_APP:
      return {
        type: "weatherapp",
      };
      
    case WINDOW_TYPES.ABOUT:
      return {
        type: "about",
      };
      
    case WINDOW_TYPES.CONTACT:
      return {
        type: "contact",
      };
      
    case WINDOW_TYPES.SKILLS:
      return {
        type: "skills",
      };
      
    case WINDOW_TYPES.SETTINGS:
      return {
        type: "settings",
      };
      
    case WINDOW_TYPES.BROWSER:
      return {
        type: "browser",
        url: options.initialUrl,
      };
      
    case WINDOW_TYPES.TODO_LIST:
      return {
        type: "todolist",
      };
      
    default:
      // Fallback for unknown types
      return {
        type: type,
      } as WindowContent;
  }
}

/**
 * Get default title for window based on type and content
 */
function getDefaultTitle(
  type: string,
   options: LaunchOptions
): string {
  switch (type) {
    case WINDOW_TYPES.TEXT_EDITOR:
      if (options.filePath) {
        const fileName = options.filePath.split("/").pop() || options.filePath;
        return `Text Editor - ${fileName}`;
      }
      return "Text Editor";
      
    case WINDOW_TYPES.FILE_EXPLORER:
      const path = options.initialPath || "/home/guest/Desktop";
      const displayPath = path.replace("/home/guest/", "");
      return `File Explorer - ${displayPath}`;
      
    case WINDOW_TYPES.IMAGE_VIEWER:
      if (options.filePath) {
        const fileName = options.filePath.split("/").pop() || options.filePath;
        return `Image Viewer - ${fileName}`;
      }
      return "Image Viewer";
      
    case WINDOW_TYPES.PROJECT:
      return `Project: ${options.projectId || "Unknown"}`;
      
    case WINDOW_TYPES.FOLDER:
      return `Folder: ${options.folderId || "Unknown"}`;
      
    case WINDOW_TYPES.WEATHER_APP:
      return "Weather App";
      
    case WINDOW_TYPES.ABOUT:
      return "About Me";
      
    case WINDOW_TYPES.CONTACT:
      return "Contact Information";
      
    case WINDOW_TYPES.SKILLS:
      return "Skills & Technologies";
      
    case WINDOW_TYPES.SETTINGS:
      return "Settings";
      
    case WINDOW_TYPES.BROWSER:
      return options.initialUrl ? `Browser - ${options.initialUrl}` : "Browser";
      
    case WINDOW_TYPES.TODO_LIST:
      return "To-Do List";
      
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
