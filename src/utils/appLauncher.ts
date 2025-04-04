// Enhanced appLauncher.ts with launchApplication export
import { Dispatch } from "react";
import { DesktopAction } from "../context/DesktopContext";

/**
 * Launch an application with the given name
 * @param appName Name of the application to launch
 * @param dispatch Dispatch function from DesktopContext
 * @param options Optional configuration for the application
 */
export const launchApplication = (
  appName: string,
  dispatch: Dispatch<DesktopAction>,
  options: any = {}
) => {
  // Generate a unique ID for the window
  const timestamp = Date.now();
  const windowId = `${appName.toLowerCase().replace(/\s+/g, "-")}-${timestamp}`;

  // Default position with slight randomization
  const defaultPosition = {
    x: 100 + Math.floor(Math.random() * 50),
    y: 100 + Math.floor(Math.random() * 50),
  };

  switch (appName.toLowerCase()) {
    case "text editor":
      dispatch({
        type: "OPEN_WINDOW",
        payload: {
          id: windowId,
          title: options.title || "Text Editor",
          type: "texteditor",
          content: options.initialTextEditor || { type: "texteditor" },
          minimized: false,
          position: options.position || defaultPosition,
          size: options.size || { width: 600, height: 400 },
        },
      });
      break;

    case "file explorer":
      dispatch({
        type: "OPEN_WINDOW",
        payload: {
          id: windowId,
          title: options.title || "File Explorer",
          type: "fileexplorer",
          content: {
            type: "fileexplorer",
            initialPath: options.initialPath || "/home/guest",
          },
          minimized: false,
          position: options.position || defaultPosition,
          size: options.size || { width: 600, height: 450 },
        },
      });
      break;

    case "about me":
      dispatch({
        type: "OPEN_WINDOW",
        payload: {
          id: "about",
          title: "About Me",
          content: "about",
          minimized: false,
          position: options.position || { x: 150, y: 100 },
          size: options.size || { width: 500, height: 400 },
        },
      });
      break;

    case "weather app":
      dispatch({
        type: "OPEN_WINDOW",
        payload: {
          id: windowId,
          title: "Weather App",
          type: "weatherapp",
          content: { type: "weatherapp" },
          minimized: false,
          position: options.position || { x: 150, y: 150 },
          size: options.size || { width: 500, height: 460 },
        },
      });
      break;

    default:
      console.warn(`Unknown app: ${appName}`);
      return;
  }

  // Close start menu when app is launched
  dispatch({
    type: "TOGGLE_START_MENU",
    payload: { startMenuOpen: false },
  });
};

// For backward compatibility, export launchApp as an alias of launchApplication
export const launchApp = launchApplication;

// Get icon for app
export const getAppIcon = (appName: string): string => {
  switch (appName.toLowerCase()) {
    case "text editor":
      return "/assets/win98-icons/png/notepad_file-0.png";
    case "file explorer":
      return "/assets/win98-icons/png/directory_explorer-0.png";
    case "about me":
      return "/assets/win98-icons/png/address_book_user.png";
    case "weather app":
      return "/assets/win98-icons/png/sun-0.png";
    case "my projects":
      return "/assets/win98-icons/png/briefcase-0.png";
    case "skills":
      return "/assets/win98-icons/png/application_lightning-0.png";
    case "contact":
      return "/assets/win98-icons/png/email-0.png";
    default:
      return "/assets/win98-icons/png/application-0.png";
  }
};
