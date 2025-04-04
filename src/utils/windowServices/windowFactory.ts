// src/utils/WindowFactory.ts
import { WindowContent, Window, WindowOptions } from "../../types";
import { WINDOW_TYPES } from "../constants";
import {
  WINDOW_DEFAULT_SIZES,
  WINDOW_SIZE_CONSTRAINTS,
  Z_INDEX,
} from "../constants/windowConstants";
import {
  calculateWindowPosition,
  ensureWindowVisibility,
  getDefaultWindowSize,
} from "./WindowPositionService";

class WindowFactory {
  /**
   * Create a window with specified options
   * @param type Window type (texteditor, fileexplorer, etc.)
   * @param existingWindows Currently open windows
   * @param options Window configuration options
   * @returns Window object ready to dispatch
   */
  create(
    type: string,
    existingWindows: Window[] = [],
    options: WindowOptions = {}
  ): Window {
    // Generate a unique ID if not provided
    const id = options.id || `${type}-${Date.now()}`;

    // Get default size for this window type
    const defaultSize = getDefaultWindowSize(type);

    // Set position with cascading effect if not specified
    const position =
      options.position || calculateWindowPosition(type, existingWindows);

    // Ensure position is valid (window will be visible)
    const size = options.size || defaultSize;
    const validPosition = ensureWindowVisibility(position, size);

    // Create the window object
    return {
      id,
      title: options.title || this.getDefaultTitle(type, options.content),
      content: options.content || { type },
      position: validPosition,
      size,
      minimized: options.minimized || false,
      type,
      zIndex: Z_INDEX.WINDOW_NORMAL,
    };
  }

  /**
   * Create a text editor window
   * @param existingWindows Currently open windows
   * @param filePath Optional path to file to open
   * @param options Additional options
   * @returns Text editor window
   */
  createTextEditor(
    existingWindows: Window[] = [],
    filePath?: string,
    options: WindowOptions = {}
  ): Window {
    const type = WINDOW_TYPES.TEXT_EDITOR;
    const id = options.id || `${type}-${filePath || "new"}-${Date.now()}`;

    const title =
      options.title ||
      (filePath
        ? `Text Editor - ${filePath.split("/").pop()}`
        : "New Document");

    const content = {
      type: "texteditor",
      filePath,
    };

    // Create window with the prepared content
    return this.create(type, existingWindows, {
      ...options,
      id,
      title,
      content,
    });
  }

  /**
   * Create a file explorer window
   * @param existingWindows Currently open windows
   * @param initialPath Initial directory path
   * @param options Additional options
   * @returns File explorer window
   */
  createFileExplorer(
    existingWindows: Window[] = [],
    initialPath: string = "/home/guest",
    options: WindowOptions = {}
  ): Window {
    const type = WINDOW_TYPES.FILE_EXPLORER;
    const id = options.id || `${type}-${Date.now()}`;

    const content = {
      type: "fileexplorer",
      initialPath,
    };

    return this.create(type, existingWindows, {
      ...options,
      id,
      title: options.title || "File Explorer",
      content,
    });
  }

  /**
   * Create an image viewer window
   * @param existingWindows Currently open windows
   * @param filePath Path to image file
   * @param options Additional options
   * @returns Image viewer window
   */
  createImageViewer(
    existingWindows: Window[] = [],
    filePath: string,
    options: WindowOptions = {}
  ): Window {
    const type = WINDOW_TYPES.IMAGE_VIEWER;
    const id =
      options.id ||
      `${type}-${filePath.replace(/[\/\\:]/g, "_")}-${Date.now()}`;

    const title =
      options.title ||
      (filePath
        ? `Image Viewer - ${filePath.split("/").pop()}`
        : "Image Viewer");

    const content = {
      type: "imageviewer",
      filePath,
    };

    return this.create(type, existingWindows, {
      ...options,
      id,
      title,
      content,
    });
  }

  /**
   * Create a project window
   * @param existingWindows Currently open windows
   * @param projectId Project identifier
   * @param projectTitle Project title
   * @param options Additional options
   * @returns Project window
   */
  createProjectWindow(
    existingWindows: Window[] = [],
    projectId: string,
    projectTitle: string,
    options: WindowOptions = {}
  ): Window {
    const type = WINDOW_TYPES.PROJECT;
    const id = options.id || `${type}-${projectId}`;

    const content = {
      type: "project",
      projectId,
    };

    return this.create(type, existingWindows, {
      ...options,
      id,
      title: options.title || projectTitle,
      content,
    });
  }

  /**
   * Create a weather app window
   * @param existingWindows Currently open windows
   * @param options Additional options
   * @returns Weather app window
   */
  createWeatherApp(
    existingWindows: Window[] = [],
    options: WindowOptions = {}
  ): Window {
    const type = WINDOW_TYPES.WEATHER_APP;
    const id = options.id || `${type}-${Date.now()}`;

    const content = {
      type: "weatherapp",
    };

    return this.create(type, existingWindows, {
      ...options,
      id,
      title: options.title || "Weather App",
      content,
    });
  }

  /**
   * Create a folder window
   * @param existingWindows Currently open windows
   * @param folderId Folder identifier
   * @param folderTitle Folder title
   * @param options Additional options
   * @returns Folder window
   */
  createFolderWindow(
    existingWindows: Window[] = [],
    folderId: string,
    folderTitle: string,
    options: WindowOptions = {}
  ): Window {
    const type = WINDOW_TYPES.FOLDER;
    const id = options.id || `${type}-${folderId}`;

    const content = {
      type: "folder",
      folderId,
    };

    return this.create(type, existingWindows, {
      ...options,
      id,
      title: options.title || folderTitle,
      content,
    });
  }

  /**
   * Generate a default title based on window type and content
   * @param type Window type
   * @param content Window content
   * @returns Default window title
   */
  private getDefaultTitle(type: string, content?: WindowContent): string {
    switch (type) {
      case WINDOW_TYPES.TEXT_EDITOR:
        return "Text Editor";
      case WINDOW_TYPES.FILE_EXPLORER:
        return "File Explorer";
      case WINDOW_TYPES.IMAGE_VIEWER:
        return "Image Viewer";
      case WINDOW_TYPES.PROJECT:
        return "Project";
      case WINDOW_TYPES.ABOUT:
        return "About Me";
      case WINDOW_TYPES.CONTACT:
        return "Contact";
      case WINDOW_TYPES.SKILLS:
        return "Skills";
      case WINDOW_TYPES.WEATHER_APP:
        return "Weather App";
      case WINDOW_TYPES.FOLDER:
        return "Folder";
      default:
        return "Window";
    }
  }
}

// Export singleton instance
export const windowFactory = new WindowFactory();
export default windowFactory;