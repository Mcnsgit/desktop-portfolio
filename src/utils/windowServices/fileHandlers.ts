// src/utils/windowServices/fileHandlers.ts
import { Dispatch } from "react";
import { DesktopAction } from "../../types"; // Import from types
import { createWindow } from "./windowFactory";

/**
 * Open a text editor window
 * @param dispatch State dispatch function
 * @param filePath Optional file path to open
 */
export const openTextEditor = (
  dispatch: Dispatch<DesktopAction>,
  filePath?: string
) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: createWindow("texteditor", { filePath }),
  });
};

/**
 * Open an image viewer window
 * @param dispatch State dispatch function
 * @param filePath Path to the image file
 */
export const openImageViewer = (
  dispatch: Dispatch<DesktopAction>,
  filePath: string
) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: createWindow("imageviewer", { filePath }),
  });
};

/**
 * Open a file explorer window
 * @param dispatch State dispatch function
 * @param initialPath Initial directory path
 */
export const openFileExplorer = (
  dispatch: Dispatch<DesktopAction>,
  initialPath = "/home/guest"
) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: createWindow("fileexplorer", { initialPath }),
  });
};

/**
 * Open a weather app window
 * @param dispatch State dispatch function
 */
export const openWeatherApp = (dispatch: Dispatch<DesktopAction>) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: createWindow("weatherapp"),
  });
};

/**
 * Open a folder window
 * @param dispatch State dispatch function
 * @param folderId Folder identifier
 * @param folderTitle Folder title
 */
export const openFolder = (
  dispatch: Dispatch<DesktopAction>,
  folderId: string,
  folderTitle: string
) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: createWindow("folder", { folderId, title: folderTitle }),
  });
};

/**
 * Open a project window
 * @param dispatch State dispatch function
 * @param projectId Project identifier
 * @param projectTitle Project title
 */
export const openProject = (
  dispatch: Dispatch<DesktopAction>,
  projectId: string,
  projectTitle: string
) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: createWindow("project", { projectId, title: projectTitle }),
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
 * @param filePath Path to the file
 */
export const openFileWithAppropriateApp = (
  dispatch: Dispatch<DesktopAction>,
  filePath: string
) => {
  const fileType = getFileTypeByExtension(filePath);

  switch (fileType) {
    case "image":
      openImageViewer(dispatch, filePath);
      break;
    case "text":
    default:
      openTextEditor(dispatch, filePath);
      break;
  }
};
