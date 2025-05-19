// Enhanced appLauncher.ts with launchApplication export
import { Dispatch } from "react";
import { DesktopAction } from "../context/DesktopContext";
import { windowFactory } from "./windowServices/windowFactory";
// import { WindowOptions as WindowOptionsType } from "./windowServices/windowFactory";
import { Window, WindowContent } from "../types"; // Ensure correct Window type is imported

// Define a more specific options type for launchApplication, extending general WindowOptions
// This helps clarify what kind of specific properties might be passed for different apps.
interface AppLaunchOptions {
  id?: string;
  title?: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  minimized?: boolean;
  // Specific content-related properties that might be passed at the top level for convenience
  filePath?: string;      // For TextEditor, ImageViewer
  initialPath?: string;   // For FileExplorer
  projectId?: string;     // For ProjectWindow
  folderId?: string;      // For FolderWindow
  initialUrl?: string;    // For BrowserWindow
  // If a full content object is provided, it might take precedence or be merged.
  content?: WindowContent; 
}

/**
 * Launch an application with the given name
 * @param appName Name of the application to launch
 * @param dispatch Dispatch function from DesktopContext
 * @param existingWindows Array of currently open windows, to be passed to windowFactory for positioning
 * @param options Optional configuration for the application
 */
export const launchApplication = (
  appName: string,
  dispatch: Dispatch<DesktopAction>,
  existingWindows: Window[],
  options: AppLaunchOptions = {}
) => {
  let windowPayload: Window | null = null;

  // Extract specific properties from options for clarity, falling back to content if necessary
  const filePath = options.filePath || (options.content && 'filePath' in options.content ? options.content.filePath : undefined);
  const initialPath = options.initialPath || (options.content && 'initialPath' in options.content ? options.content.initialPath : undefined);
  const projectId = options.projectId || (options.content && 'projectId' in options.content ? options.content.projectId : undefined);
  const folderId = options.folderId || (options.content && 'folderId' in options.content ? options.content.folderId : undefined);
  const initialUrl = options.initialUrl || (options.content && 'url' in options.content ? options.content.url : undefined);

  // General options to pass to the factory (excluding the specific ones handled above)
  const generalOptions: AppLaunchOptions = { ...options };
  delete generalOptions.filePath;
  delete generalOptions.initialPath;
  delete generalOptions.projectId;
  delete generalOptions.folderId;
  delete generalOptions.initialUrl;

  // Generate a unique ID for the window
  // const timestamp = Date.now();
  // const windowId = `${appName.toLowerCase().replace(/\s+/g, "-")}-${timestamp}`;

  // // Default position with slight randomization
  // const defaultPosition = {
  //   x: 100 + Math.floor(Math.random() * 50),
  //   y: 100 + Math.floor(Math.random() * 50),
  // };

  switch (appName.toLowerCase()) {
    case "texteditor":
    case "text editor":
      windowPayload = windowFactory.createTextEditor(existingWindows, filePath, generalOptions);
      break;
    case "fileexplorer":
    case "file explorer":
      windowPayload = windowFactory.createFileExplorer(existingWindows, initialPath, generalOptions);
      break;
    case "imageviewer":
    case "image viewer":
      if (filePath) {
        windowPayload = windowFactory.createImageViewer(existingWindows, filePath, generalOptions);
      } else {
        console.warn("Image Viewer launch requires a filePath.");
      }
      break;
    case "project":
      if (projectId) {
        // The factory takes projectId and an optional projectTitle. Title can come from generalOptions.title.
        windowPayload = windowFactory.createProjectWindow(existingWindows, projectId, generalOptions.title, generalOptions);
      } else {
        console.warn("Project launch requires a projectId.");
      }
      break;
    case "folder":
      if (folderId) {
        // The factory takes folderId and an optional folderTitle. Title can come from generalOptions.title.
        windowPayload = windowFactory.createFolderWindow(existingWindows, folderId, generalOptions.title, generalOptions);
      } else {
        console.warn("Folder launch requires a folderId.");
      }
      break;
    case "weatherapp":
    case "weather app":
      windowPayload = windowFactory.createWeatherApp(existingWindows, generalOptions);
      break;
    case "aboutme":
    case "about me":
    case "about":
      windowPayload = windowFactory.createAboutMeWindow(existingWindows, generalOptions);
      break;
    case "contact":
      windowPayload = windowFactory.createContactWindow(existingWindows, generalOptions);
      break;
    case "settings":
      windowPayload = windowFactory.createSettingsWindow(existingWindows, generalOptions);
      break;
    case "browser":
    case "web browser":
      // Pass initialUrl explicitly if the factory supports it like this, or ensure it's part of generalOptions.content
      windowPayload = windowFactory.createBrowserWindow(existingWindows, { ...generalOptions, initialUrl });
      break;
    default:
      console.warn(`Unknown app name/type for launchApplication: ${appName}`);
      return;
  }

  if (windowPayload) {
    dispatch({
      type: "OPEN_WINDOW",
      payload: windowPayload,
    });
    // It's generally better for the caller (e.g., StartMenu) to handle closing itself.
    // dispatch({ type: "TOGGLE_START_MENU", payload: { startMenuOpen: false } });
  }
};

// For backward compatibility, export launchApp as an alias of launchApplication
export const launchApp = launchApplication;

// Get icon for app
export const getAppIcon = (appName: string): string => {
  switch (appName.toLowerCase()) {
    case "texteditor":
    case "text editor":
      return "/assets/icons/win98/png/notepad_file-0.png";
    case "fileexplorer":
    case "file explorer":
      return "/assets/icons/win98/png/directory_explorer-0.png";
    case "imageviewer": // Added for completeness, assuming it might be in a general app list
    case "image viewer":
      return "/assets/icons/win98/png/image_file-0.png"; // Placeholder, use actual image viewer icon
    case "aboutme":
    case "about me":
    case "about":
      return "/assets/icons/win98/png/address_book_user.png";
    case "weatherapp":
    case "weather app":
      return "/assets/win98-icons/png/sun-0.png";
    case "project":
      return "/assets/icons/win98/png/briefcase-0.png";
    case "folder":
      return "/assets/icons/win98/png/directory_closed-1.png";
    case "contact":
      return "/assets/icons/win98/png/msn3-5.png";
    case "settings":
      return "/assets/icons/win98/png/settings_gear-0.png";
    case "browser":
    case "web browser":
      return "/assets/icons/win98/png/html-0.png"; 
    // Add other app types as needed, e.g., SKILLS
    // case "skills":
    //   return "/assets/icons/win98/png/card_reader-3.png";
    default:
      return "/assets/icons/win98/png/application_blue_lines-0.png";
  }
};
