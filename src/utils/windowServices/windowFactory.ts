// src/utils/windowServices/windowFactory.ts
import { WindowContent, Window, TextEditorContent, ImageViewerContent, ProjectContent, FolderContent, BrowserContent } from "../../types";
import { WINDOW_TYPES } from "../constants";
import {

  Z_INDEX,
} from "../constants/windowConstants";
import windowPositionService from "./WindowPositionService";

interface WindowOptions {
  id?: string;
  title?: string;
  content?: WindowContent;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  minimized?: boolean;
  type?: string;
}

/**
 * Factory class for creating window objects
 */
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
    const defaultSize = windowPositionService.getDefaultWindowSize(type);

    // Set position with cascading effect if not specified
    const position =
      options.position ||
      windowPositionService.calculateWindowPosition(type, existingWindows);

    // Ensure position is valid (window will be visible)
    const size = options.size || defaultSize;
    const validPosition = windowPositionService.ensureWindowVisibility(
      position,
      size
    );

    // Create the window object
    return {
      id,
      title: options.title || this.getDefaultTitle(type, options.content),
      content: options.content || { type } as WindowContent,
      position: validPosition,
      size,
      minimized: options.minimized || false,
      type,
      zIndex: Z_INDEX.WINDOW_NORMAL,
      isMaximized: false,
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

    const content: TextEditorContent = {
      type: "texteditor",
      filePath,
    };

    const { type: _omitType, ...optionsWithoutType } = options;

    return this.create(type, existingWindows, {
      ...optionsWithoutType,
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

    const content: WindowContent = {
      type: "fileexplorer",
      initialPath,
    };

    const { type: _omitType, ...optionsWithoutType } = options;

    return this.create(type, existingWindows, {
      ...optionsWithoutType,
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

    const content: ImageViewerContent = {
      type: "imageviewer",
      filePath,
    };

    const { type: _omitType, ...optionsWithoutType } = options;

    return this.create(type, existingWindows, {
      ...optionsWithoutType,
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
    projectTitle?: string,
    options: WindowOptions = {}
  ): Window {
    const type = WINDOW_TYPES.PROJECT;
    const id = options.id || `${type}-${projectId}`;

    const content: ProjectContent = {
      type: "project",
      projectId,
    };

    const { type: _omitType, ...optionsWithoutType } = options;

    return this.create(type, existingWindows, {
      ...optionsWithoutType,
      id,
      title: options.title || projectTitle || "Project",
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

    const content: WindowContent = {
      type: "weatherapp",
    };

    const { type: _omitType, ...optionsWithoutType } = options;

    return this.create(type, existingWindows, {
      ...optionsWithoutType,
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
    folderTitle?: string,
    options: WindowOptions = {}
  ): Window {
    const type = WINDOW_TYPES.FOLDER;
    const id = options.id || `${type}-${folderId}`;

    const content: FolderContent = {
      type: "folder",
      folderId,
    };

    const { type: _omitType, ...optionsWithoutType } = options;

    return this.create(type, existingWindows, {
      ...optionsWithoutType,
      id,
      title: options.title || folderTitle || "Folder",
      content,
    });
  }

  /**
   * Create an About Me window
   * @param existingWindows Currently open windows
   * @param options Additional options
   * @returns About Me window
   */
  createAboutMeWindow(
    existingWindows: Window[] = [],
    options: WindowOptions = {}
  ): Window {
    const type = WINDOW_TYPES.ABOUT;
    const id = options.id || `${type}-${Date.now()}`;
    const content: WindowContent = { type: "aboutme" };
    const { type: _omitType, ...optionsWithoutType } = options;

    return this.create(type, existingWindows, {
      ...optionsWithoutType,
      id,
      title: options.title || "About Me",
      content,
    });
  }

  /**
   * Create a Contact window
   * @param existingWindows Currently open windows
   * @param options Additional options
   * @returns Contact window
   */
  createContactWindow(
    existingWindows: Window[] = [],
    options: WindowOptions = {}
  ): Window {
    const type = WINDOW_TYPES.CONTACT;
    const id = options.id || `${type}-${Date.now()}`;
    const content: WindowContent = { type: "contact" };
    const { type: _omitType, ...optionsWithoutType } = options;

    return this.create(type, existingWindows, {
      ...optionsWithoutType,
      id,
      title: options.title || "Contact",
      content,
    });
  }

  /**
   * Create a Settings window
   * @param existingWindows Currently open windows
   * @param options Additional options
   * @returns Settings window
   */
  createSettingsWindow(
    existingWindows: Window[] = [],
    options: WindowOptions = {}
  ): Window {
    const type = WINDOW_TYPES.SETTINGS;
    const id = options.id || `${type}-${Date.now()}`;
    const content: WindowContent = { type: "settings" };
    const { type: _omitType, ...optionsWithoutType } = options;

    return this.create(type, existingWindows, {
      ...optionsWithoutType,
      id,
      title: options.title || "Settings",
      content,
    });
  }

  /**
   * Create a Browser window
   * @param existingWindows Currently open windows
   * @param options Additional options, e.g., initial URL
   * @returns Browser window
   */
  createBrowserWindow(
    existingWindows: Window[] = [],
    options: WindowOptions & { initialUrl?: string } = {}
  ): Window {
    const type = WINDOW_TYPES.BROWSER;
    const id = options.id || `${type}-${Date.now()}`;
    const content: BrowserContent = {
      type: "browser",
      url: options.initialUrl || "about:blank",
    };
    const { type: _omitType, initialUrl: _initialUrl, content: _omitContent, ...optionsWithoutSpecifics } = options;

    return this.create(type, existingWindows, {
      ...optionsWithoutSpecifics,
      id,
      title: options.title || "Web Browser",
      content,
    });
  }

  /**
   * Get default title for a window type
   * @param type Window type
   * @param content Optional window content for context
   * @returns Default title string
   */
  private getDefaultTitle(type: string, content?: WindowContent): string {
    switch (type) {
      case WINDOW_TYPES.TEXT_EDITOR:
        if (content && content.type === "texteditor") {
          const textContent = content as TextEditorContent;
          if (textContent.filePath) {
            return `Text Editor - ${textContent.filePath.split("/").pop()}`;
          }
          return "New Document"; // Or "Text Editor - Untitled"
        }
        return "Text Editor"; // Fallback if content is not TextEditorContent
      case WINDOW_TYPES.FILE_EXPLORER:
        return "File Explorer";
      case WINDOW_TYPES.IMAGE_VIEWER:
        if (content && content.type === "imageviewer") {
          const imageContent = content as ImageViewerContent;
          // filePath is mandatory in ImageViewerContent, so direct access is fine if content is confirmed ImageViewerContent
          return `Image Viewer - ${imageContent.filePath.split("/").pop()}`;
        }
        return "Image Viewer"; // Fallback
      case WINDOW_TYPES.PROJECT:
        if (content && content.type === "project") {
          const projectContent = content as ProjectContent;
          return projectContent.projectId ? `Project - ${projectContent.projectId}` : "Project";
        }
        return "Project"; // Fallback
      case WINDOW_TYPES.WEATHER_APP:
        return "Weather App";
      case WINDOW_TYPES.FOLDER:
        if (content && content.type === "folder") {
          const folderContent = content as FolderContent;
          return folderContent.folderId ? `Folder - ${folderContent.folderId}` : "Folder";
        }
        return "Folder"; // Fallback
      case WINDOW_TYPES.ABOUT: 
        return "About Me";
      case WINDOW_TYPES.CONTACT:
        return "Contact";
      case WINDOW_TYPES.SETTINGS:
        return "Settings";
      case WINDOW_TYPES.BROWSER:
        return "Web Browser";
      default:
        return "Window";
    }
  }
}

export const windowFactory = new WindowFactory();
export default windowFactory;
export type { WindowOptions };
