// src/utils/fileHandlers.ts
import { Dispatch } from "react";
import { DesktopAction } from "../context/DesktopContext";

// Open a text editor window
export const openTextEditor = (
  dispatch: Dispatch<DesktopAction>,
  filePath?: string
) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: {
      id: `texteditor-${filePath || "new"}`,
      title: filePath
        ? filePath.split("/").pop() || "Text Editor"
        : "New Document",
      content: {
        type: "texteditor",
        filePath,
      },
      minimized: false,
      position: { x: 120, y: 120 },
      size: { width: 600, height: 400 },
      type: "texteditor",
    },
  });
};

// Open an image viewer window
export const openImageViewer = (
  dispatch: Dispatch<DesktopAction>,
  filePath: string
) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: {
      id: `imageviewer-${filePath}`,
      title: filePath.split("/").pop() || "Image Viewer",
      content: {
        type: "imageviewer",
        filePath,
      },
      minimized: false,
      position: { x: 150, y: 150 },
      size: { width: 500, height: 400 },
      type: "imageviewer",
    },
  });
};

// Open a file explorer window
export const openFileExplorer = (
  dispatch: Dispatch<DesktopAction>,
  initialPath = "/home/guest"
) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: {
      id: `fileexplorer-${Date.now()}`,
      title: "File Explorer",
      content: {
        type: "fileexplorer",
        initialPath,
      },
      minimized: false,
      position: { x: 100, y: 100 },
      size: { width: 600, height: 450 },
      type: "fileexplorer",
    },
  });
};

// Open a weather app window
export const openWeatherApp = (dispatch: Dispatch<DesktopAction>) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: {
      id: `weatherapp-${Date.now()}`,
      title: "Weather App",
      content: {
        type: "weatherapp",
      },
      minimized: false,
      position: { x: 150, y: 150 },
      size: { width: 500, height: 460 },
      type: "weatherapp",
    },
  });
};

// Open a folder window
export const openFolder = (
  dispatch: Dispatch<DesktopAction>,
  folderId: string,
  folderTitle: string
) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: {
      id: `folder-${folderId}`,
      title: folderTitle,
      content: {
        type: "folder",
        folderId,
      },
      minimized: false,
      position: { x: 120, y: 120 },
      size: { width: 500, height: 400 },
      type: "folder",
    },
  });
};

// Open a project window
export const openProject = (
  dispatch: Dispatch<DesktopAction>,
  projectId: string,
  projectTitle: string
) => {
  dispatch({
    type: "OPEN_WINDOW",
    payload: {
      id: `project-${projectId}`,
      title: projectTitle,
      content: {
        type: "project",
        projectId,
      },
      minimized: false,
      position: { x: 100, y: 100 },
      size: { width: 600, height: 450 },
      type: "project",
    },
  });
};

// Get file type by extension
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

// Open appropriate app for a file
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
