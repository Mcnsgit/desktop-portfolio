// src/utils/windowServices/fileHandlers.ts
import { Dispatch } from "react";
import { DesktopAction } from "../../context/DesktopContext";
import { windowFactory } from "./windowFactory";
import { Window } from "../../types"; // Import Window type

/**
 * Open a text editor window
 * @param dispatch State dispatch function
 * @param existingWindows Array of currently open windows
 * @param filePath Optional file path to open
 */
export const openTextEditor = (
  dispatch: Dispatch<DesktopAction>,
  existingWindows: Window[],
  filePath?: string
) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: windowFactory.createTextEditor(existingWindows, filePath),
  });
};

/**
 * Open an image viewer window
 * @param dispatch State dispatch function
 * @param existingWindows Array of currently open windows
 * @param filePath Path to the image file
 */
export const openImageViewer = (
  dispatch: Dispatch<DesktopAction>,
  existingWindows: Window[],
  filePath: string
) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: windowFactory.createImageViewer(existingWindows, filePath),
  });
};

/**
 * Open a file explorer window
 * @param dispatch State dispatch function
 * @param existingWindows Array of currently open windows
 * @param initialPath Initial directory path
 */
export const openFileExplorer = (
  dispatch: Dispatch<DesktopAction>,
  existingWindows: Window[],
  initialPath = "/home/guest"
) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: windowFactory.createFileExplorer(existingWindows, initialPath),
  });
};

/**
 * Open a weather app window
 * @param dispatch State dispatch function
 * @param existingWindows Array of currently open windows
 */
export const openWeatherApp = (dispatch: Dispatch<DesktopAction>, existingWindows: Window[]) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: windowFactory.createWeatherApp(existingWindows),
  });
};

/**
 * Open a folder window
 * @param dispatch State dispatch function
 * @param existingWindows Array of currently open windows
 * @param folderId Folder identifier
 * @param folderTitle Folder title
 */
export const openFolder = (
  dispatch: Dispatch<DesktopAction>,
  existingWindows: Window[],
  folderId: string,
  folderTitle: string
) => {
  dispatch({
    type: "OPEN_WINDOW",
    // Pass existingWindows, folderId, folderTitle. Options can be added if needed.
    payload: windowFactory.createFolderWindow(existingWindows, folderId, folderTitle),
  });
};

/**
 * Open a project window
 * @param dispatch State dispatch function
 * @param existingWindows Array of currently open windows
 * @param projectId Project identifier
 * @param projectTitle Project title
 */
export const openProject = (
  dispatch: Dispatch<DesktopAction>,
  existingWindows: Window[],
  projectId: string,
  projectTitle: string
) => {
  dispatch({
    type: "OPEN_WINDOW",
    // Pass existingWindows, projectId, projectTitle. Options can be added if needed.
    payload: windowFactory.createProjectWindow(existingWindows, projectId, projectTitle),
  });
};

/**
 * Get file type by extension
 * @param fileName File name with extension
 * @returns File type string
 */
export const getFileTypeByExtension = (fileName: string): string => {
  const ext = fileName.toLowerCase().split(".").pop() || "";

  // Text files
  if (
    ["txt", "md", "html", "htm", "css", "js", "json", "xml", "csv"].includes(
      ext
    )
  ) {
    return "text";
  }

  // Image files
  if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext)) {
    return "image";
  }

  // Default to text for unknown extensions
  return "text";
};

/**
 * Open appropriate app for a file
 * @param dispatch State dispatch function
 * @param existingWindows Array of currently open windows
 * @param filePath Path to the file
 */
export const openFileWithAppropriateApp = (
  dispatch: Dispatch<DesktopAction>,
  existingWindows: Window[],
  filePath: string
) => {
  const fileType = getFileTypeByExtension(filePath);

  switch (fileType) {
    case "image":
      openImageViewer(dispatch, existingWindows, filePath);
      break;
    case "text":
    default:
      openTextEditor(dispatch, existingWindows, filePath);
      break;
  }
};
