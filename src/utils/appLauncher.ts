// src/utils/appLauncher.ts
import { Dispatch } from "react";
import { DesktopAction, Window } from "../types";
import { createWindow, LaunchOptions } from "./windowServices/windowFactory";
import { WINDOW_TYPES } from "./constants";

export interface AppLauncherConfig {
  dispatch: Dispatch<DesktopAction>;
  existingWindows: Window[];
}

/**
 * Main application launcher - handles opening all types of windows/apps
 * This is the single point of entry for opening any windowed content
 */
export function launchApplication(
  appType: string, 
  config: AppLauncherConfig,
  options: LaunchOptions = {}
): void {
  const { dispatch, existingWindows } = config;

  // Check if window already exists for unique app types
  const existingWindow = findExistingWindow(appType, existingWindows, options);
  if (existingWindow) {
    // Focus existing window instead of creating new one
    if (existingWindow.minimized) {
      dispatch({ type: "RESTORE_WINDOW", payload: { id: existingWindow.id } });
    } else {
      dispatch({ type: "FOCUS_WINDOW", payload: { id: existingWindow.id } });
    }
    return;
  }

  // Create new window using windowFactory
  try {
    const windowConfig = createWindow(appType, options);
    dispatch({ type: "OPEN_WINDOW", payload: windowConfig });
  } catch (error) {
    console.error(`Failed to launch application ${appType}:`, error);
    // Optionally show error notification to user
  }
}

/**
 * Launch a project window with project details
 */
function launchProject(
  projectId: string,
  config: AppLauncherConfig,
  options: Partial<LaunchOptions> = {}
): void {
  launchApplication(WINDOW_TYPES.PROJECT, config, {
    ...options,
    projectId,
    title: options.title || `Project: ${projectId}`,
  });
}

/**
 * Launch file explorer at specific path
 */
function launchFileExplorer(
  config: AppLauncherConfig,
  initialPath: string = "/home/guest/Desktop",
  options: Partial<LaunchOptions> = {}
): void {
  launchApplication(WINDOW_TYPES.FILE_EXPLORER, config, {
    ...options,
    initialPath,
    title: options.title || `File Explorer - ${getDisplayPath(initialPath)}`,
  });
}

/**
 * Launch folder window for browsing folder contents
 */
function launchFolder(
  folderId: string,
  config: AppLauncherConfig,
  options: Partial<LaunchOptions> = {}
): void {
  launchApplication(WINDOW_TYPES.FOLDER, config, {
    ...options,
    folderId,
    title: options.title || `Folder: ${folderId}`,
  });
}

/**
 * Launch text editor with optional file
 */
function launchTextEditor(
  config: AppLauncherConfig,
  filePath?: string,
  options: Partial<LaunchOptions> = {}
): void {
  launchApplication(WINDOW_TYPES.TEXT_EDITOR, config, {
    ...options,
    filePath,
    title: options.title || (filePath ? getFileName(filePath) : "Text Editor"),
  });
}

/**
 * Launch image viewer with image file
 */
function launchImageViewer(
  filePath: string,
  config: AppLauncherConfig,
  options: Partial<LaunchOptions> = {}
): void {
  launchApplication(WINDOW_TYPES.IMAGE_VIEWER, config, {
    ...options,
    filePath,
    title: options.title || `Image Viewer - ${getFileName(filePath)}`,
  });
}

/**
 * Launch browser window with URL
 */
function launchBrowser(
  config: AppLauncherConfig,
  initialUrl?: string,
  options: Partial<LaunchOptions> = {}
): void {
  launchApplication(WINDOW_TYPES.BROWSER, config, {
    ...options,
    initialUrl,
    title: options.title || "Browser",
  });
}

/**
 * Launch About window
 */
function launchAbout(
  config: AppLauncherConfig,
  options: Partial<LaunchOptions> = {}
): void {
  launchApplication(WINDOW_TYPES.ABOUT, config, {
    ...options,
    title: options.title || "About Me",
  });
}

/**
 * Launch Skills window
 */
function launchSkills(
  config: AppLauncherConfig,
  options: Partial<LaunchOptions> = {}
): void {
  launchApplication(WINDOW_TYPES.SKILLS, config, {
    ...options,
    title: options.title || "Skills & Technologies",
  });
}

/**
 * Launch Contact window
 */
function launchContact(
  config: AppLauncherConfig,
  options: Partial<LaunchOptions> = {}
): void {
  launchApplication(WINDOW_TYPES.CONTACT, config, {
    ...options,
    title: options.title || "Contact Information",
  });
}

/**
 * Launch Weather App
 */
function launchWeatherApp(
  config: AppLauncherConfig,
  options: Partial<LaunchOptions> = {}
): void {
  launchApplication(WINDOW_TYPES.WEATHER_APP, config, {
    ...options,
    title: options.title || "Weather App",
  });
}

/**
 * Launch Settings window
 */
function launchSettings(
  config: AppLauncherConfig,
  options: Partial<LaunchOptions> = {}
): void {
  launchApplication(WINDOW_TYPES.SETTINGS, config, {
    ...options,
    title: options.title || "Settings",
  });
}

/**
 * Launch Todo List app
 */
function launchTodoList(
  config: AppLauncherConfig,
  options: Partial<LaunchOptions> = {}
): void {
  launchApplication(WINDOW_TYPES.TODO_LIST, config, {
    ...options,
    title: options.title || "Todo List",
  });
}

/**
 * Open file with appropriate application based on file extension
 */
function openFileWithAppropriateApp(
  filePath: string,
  config: AppLauncherConfig,
  options: Partial<LaunchOptions> = {}
): void {
  const extension = getFileExtension(filePath).toLowerCase();
  const fileName = getFileName(filePath);

  // Determine appropriate app based on file extension
  if (isTextFile(extension)) {
    launchTextEditor(config, filePath, {
      ...options,
      title: fileName,
    });
  } else if (isImageFile(extension)) {
    launchImageViewer(filePath, config, {
      ...options,
      title: `${fileName} - Image Viewer`,
    });
  } else if (extension === '.lnk') {
    // Handle shortcut files
    handleShortcutFile(filePath, config, options);
  } else {
    // Default to text editor for unknown files
    launchTextEditor(config, filePath, {
      ...options,
      title: `${fileName} - Text Editor`,
    });
  }
}

// Helper Functions

/**
 * Find existing window that matches the app type and options
 */
function findExistingWindow(
  appType: string,
  existingWindows: Window[],
  options: LaunchOptions
): Window | undefined {
  return existingWindows.find(window => {
    if (window.type !== appType) return false;

    // For file-based windows, check if same file is already open
    if ((appType === WINDOW_TYPES.TEXT_EDITOR || appType === WINDOW_TYPES.IMAGE_VIEWER) && options.filePath) {
      const content = window.content as any;
      return content.filePath === options.filePath;
    }

    // For folder/file explorer windows, check if same path is open
    if ((appType === WINDOW_TYPES.FILE_EXPLORER || appType === WINDOW_TYPES.FOLDER) && options.initialPath) {
      const content = window.content as any;
      return content.initialPath === options.initialPath || content.folderId === options.folderId;
    }

    // For project windows, check if same project is open
    if (appType === WINDOW_TYPES.PROJECT && options.projectId) {
      const content = window.content as any;
      return content.projectId === options.projectId;
    }

    // For unique windows (About, Contact, Skills, Settings), always consider existing
    if ([WINDOW_TYPES.ABOUT, WINDOW_TYPES.CONTACT, WINDOW_TYPES.SKILLS, WINDOW_TYPES.SETTINGS].includes(appType)) {
      return true;
    }

    return false;
  });
}

/**
 * Handle shortcut (.lnk) files
 */
async function handleShortcutFile(
  filePath: string,
  config: AppLauncherConfig,
  options: LaunchOptions
): Promise<void> {
  try {
    // In a real implementation, you'd read the shortcut target from the file system
    // For now, we'll simulate some common shortcuts
    const fileName = getFileName(filePath);
    
    switch (fileName) {
      case 'Text Editor.lnk':
        launchTextEditor(config, undefined, options);
      break;
      case 'My Projects.lnk':
        launchFileExplorer(config, '/projects', options);
      break;
      case 'My Documents.lnk':
        launchFileExplorer(config, '/home/guest/Documents', options);
      break;
    default:
        console.warn(`Unknown shortcut: ${fileName}`);
        break;
  }
  } catch (error) {
    console.error(`Failed to handle shortcut ${filePath}:`, error);
  }
}

/**
 * Extract file name from path
 */
function getFileName(filePath: string): string {
  return filePath.split('/').pop() || filePath;
}

/**
 * Extract file extension from path
 */
function getFileExtension(filePath: string): string {
  const fileName = getFileName(filePath);
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.substring(lastDot) : '';
}

/**
 * Get display-friendly path (e.g., remove /home/guest prefix)
 */
function getDisplayPath(path: string): string {
  if (path.startsWith('/home/guest/')) {
    return path.substring(11); // Remove '/home/guest'
  }
  return path;
}

/**
 * Check if file extension is a text file
 */
function isTextFile(extension: string): boolean {
  const textExtensions = ['.txt', '.md', '.html', '.htm', '.css', '.js', '.json', '.xml', '.csv'];
  return textExtensions.includes(extension);
}

/**
 * Check if file extension is an image file
 */
function isImageFile(extension: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'];
  return imageExtensions.includes(extension);
}

// Export all launch functions
export {
  launchProject,
  launchFileExplorer,
  launchFolder,
  launchTextEditor,
  launchImageViewer,
  launchBrowser,
  launchAbout,
  launchSkills,
  launchContact,
  launchWeatherApp,
  launchSettings,
  launchTodoList,
  openFileWithAppropriateApp,
};
