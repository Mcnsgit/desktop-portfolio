// src/components/windows/WindowTypes/FileExplorerWindow.tsx
import React, { useState, useEffect } from "react";
import { DesktopAction, useDesktop } from "../../../context/DesktopContext";
import { useFileSystem } from "../../../context/FileSystemContext";
import {
  listFiles,
  fs,
  readFileContent,
  writeFileContent,
  createDirectory,
  deleteFileOrDir,
  renameFileOrDir,
  createShortcut,
} from "../../../utils/fileSystem";
import styles from "../../styles/FileExplorerWindow.module.scss";
import Image from "next/image";
import ImageViewerWindow from "./ImageViewerWindow";
import TextEditor from "./TextEditorWindow"; // Adjust the path as necessary
import {
  openFileExplorer,
  openFileWithAppropriateApp,
} from "@/utils/fileHandlers";

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  isLink?: boolean;
  linkTarget?: string;
  size?: number;
  modified?: Date;
}

interface FileExplorerWindowProps {
  initialPath?: string;
}

const FileExplorerWindow: React.FC<FileExplorerWindowProps> = ({
  initialPath = "/home/guest",
}) => {
  const fileSystemContext = useFileSystem();
  const isLoaded = fileSystemContext?.isLoaded ?? false;
  const { dispatch } = useDesktop();
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newName, setNewName] = useState("");
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [contextMenuTarget, setContextMenuTarget] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"icons" | "list" | "details">(
    "icons"
  );
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Load files in the current directory
  useEffect(() => {
    if (isLoaded) {
      const filesList = listFiles(currentPath);
      // Convert to the expected format with additional properties
      const formattedFiles = filesList.map((item) => {
        // Default values for properties that might be missing
        const fileItem: FileItem = {
          name: item.name,
          path: `${currentPath}/${item.name}`.replace(/\/\//g, "/"),
          isDirectory: false,
          isFile: true,
          isLink: item.isLink,
          linkTarget: item.linkTarget,
        };

        // Try to get additional file stats if possible
        try {
          const stats =
            item.isLink && item.linkTarget
              ? fs.statSync(item.linkTarget)
              : fs.statSync(fileItem.path);

          fileItem.isDirectory = stats.isDirectory();
          fileItem.isFile = stats.isFile();
          fileItem.size = stats.size;
          fileItem.modified = stats.mtime;
        } catch (error) {
          // If stats fail, use defaults and assume it's a file
          console.warn(`Couldn't get stats for ${fileItem.path}`);
        }

        return fileItem;
      });

      setFiles(formattedFiles);
    }
  }, [currentPath, isLoaded]);

  // Get appropriate icon for the file
  const getFileIcon = (item: FileItem) => {
    if (item.isDirectory) {
      return "/assets/win98-icons/png/directory_closed-0.png";
    }

    if (item.isLink || item.name.endsWith(".lnk")) {
      return "/assets/win98-icons/png/shortcut-1.png";
    }

    const ext = item.name.toLowerCase().split(".").pop();

    switch (ext) {
      case "txt":
        return "/assets/win98-icons/png/notepad_file-0.png";
      case "md":
        return "/assets/win98-icons/png/document_text-0.png";
      case "html":
      case "htm":
        return "/assets/win98-icons/png/html-0.png";
      case "css":
        return "/assets/win98-icons/png/document_gear-1.png";
      case "js":
        return "/assets/win98-icons/png/script_file-0.png";
      case "json":
        return "/assets/win98-icons/png/document_components-0.png";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
        return "/assets/win98-icons/png/image-0.png";
      default:
        return "/assets/win98-icons/png/document-0.png";
    }
  };

  // Navigation functions
  const navigateTo = (path: string) => {
    // Add to history
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), path]);
    setHistoryIndex((prev) => prev + 1);
    setCurrentPath(path);
    setSelectedFile(null);
  };

  const navigateBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setCurrentPath(history[historyIndex - 1]);
      setSelectedFile(null);
    }
  };

  const navigateForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setCurrentPath(history[historyIndex + 1]);
      setSelectedFile(null);
    }
  };

  const navigateUp = () => {
    if (currentPath === "/") return;
    const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
    navigateTo(parentPath);
  };

  // Handle double-click on a file or folder
  const handleDoubleClick = (item: FileItem) => {
    if (item.isDirectory) {
      navigateTo(item.path);
    } else if (item.isLink || item.name.endsWith(".lnk")) {
      // Handle shortcuts
      const target = item.linkTarget || "";

      if (target.startsWith("app:")) {
        // Handle application shortcuts
        const appName = target.substring(4);
        switch (appName) {
          case "texteditor":
            openTextEditor();
            break;
          case "weatherapp":
            openWeatherApp(dispatch);
            break;
          case "fileexplorer":
            openFileExplorer(dispatch);
            break;
          default:
            console.warn(`Unknown application shortcut: ${appName}`);
        }
      } else if (target) {
        // Navigate to folder
        navigateTo(target);
      }
    } else {
      // Open file with appropriate app
      openFileWithAppropriateApp(dispatch, item.path);
    }
  };
  // Open text editor
  const openTextEditor = (filePath?: string) => {
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: `texteditor-${filePath || "new"}`,
        title: filePath
          ? filePath.split("/").pop() || "Text Editor"
          : "New Document",
        content: <TextEditor filePath={filePath} />,
        minimized: false,
        position: { x: 120, y: 120 },
        size: { width: 600, height: 400 },
      },
    });
  };

  // Open image viewer
  const openImageViewer = (filePath: string) => {
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: `imageviewer-${filePath}`,
        title: filePath
          ? filePath.split("/").pop() || "Image Viewer"
          : "Image Viewer",
        content: <ImageViewerWindow filePath={filePath} />,
        minimized: false,
        position: { x: 150, y: 150 },
        size: { width: 500, height: 400 },
      },
    });
  };

  // File operations
  const handleCreateFile = () => {
    setIsCreatingFile(true);
    setIsCreatingFolder(false);
    setNewName("");
  };

  const handleCreateFolder = () => {
    setIsCreatingFolder(true);
    setIsCreatingFile(false);
    setNewName("");
  };

  const handleCreateShortcut = (targetPath?: string) => {
    if (!targetPath && !selectedFile) return;

    const path = targetPath || selectedFile || "";
    const fileName = path.split("/").pop() || "";
    const shortcutName = `${fileName.split(".")[0]} - Shortcut.lnk`;
    const shortcutPath = `${currentPath}/${shortcutName}`;

    createShortcut(shortcutPath, path);
    refreshFiles();
  };

  // Handle save (for new file/folder or rename)
  const handleSave = () => {
    if (!newName) return;

    const newPath = `${currentPath}/${newName}`.replace(/\/\//g, "/");

    if (isCreatingFile) {
      if (writeFileContent(newPath, "")) {
        refreshFiles();
        openTextEditor(newPath);
      }
    } else if (isCreatingFolder) {
      if (createDirectory(newPath)) {
        refreshFiles();
      }
    } else if (isRenaming && selectedFile) {
      if (renameFileOrDir(selectedFile, newPath)) {
        setSelectedFile(newPath);
        refreshFiles();
      }
    }

    // Reset states
    setIsCreatingFile(false);
    setIsCreatingFolder(false);
    setIsRenaming(null);
    setNewName("");
  };

  // Handle delete
  const handleDelete = (path: string) => {
    if (window.confirm(`Are you sure you want to delete ${path}?`)) {
      if (deleteFileOrDir(path)) {
        if (selectedFile === path) {
          setSelectedFile(null);
        }
        refreshFiles();
      }
    }
  };

  // Handle rename
  const handleRename = (path: string) => {
    setIsRenaming(path);
    const name = path.split("/").pop() || "";
    setNewName(name);
  };

  // Refresh file list
  const refreshFiles = () => {
    const filesList = listFiles(currentPath);
    // Convert to the expected format with additional properties
    const formattedFiles = filesList.map((item) => {
      // Default values for properties that might be missing
      const fileItem: FileItem = {
        name: item.name,
        path: `${currentPath}/${item.name}`.replace(/\/\//g, "/"),
        isDirectory: false,
        isFile: true,
        isLink: item.isLink,
        linkTarget: item.linkTarget,
      };

      return fileItem;
    });

    setFiles(formattedFiles);
  };

  // Handle file selection
  const handleSelect = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(path);
  };

  // Context menu
  const handleContextMenu = (e: React.MouseEvent, item?: FileItem) => {
    e.preventDefault();
    e.stopPropagation();

    setShowContextMenu(true);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setContextMenuTarget(item ? item.path : null);

    if (item) {
      setSelectedFile(item.path);
    }
  };

  // Handle click outside to close context menu
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(false);
    };

    if (showContextMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showContextMenu]);

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsCreatingFile(false);
      setIsCreatingFolder(false);
      setIsRenaming(null);
      setShowContextMenu(false);
    }
  };

  // Generate context menu items
  const getContextMenuItems = () => {
    if (contextMenuTarget) {
      // File or folder context menu
      const targetItem = files.find((f) => f.path === contextMenuTarget);

      return [
        {
          label: "Open",
          action: () => {
            if (targetItem) handleDoubleClick(targetItem);
          },
        },
        {
          label: "Edit",
          action: () => {
            if (targetItem && !targetItem.isDirectory) {
              openTextEditor(targetItem.path);
            }
          },
          disabled: targetItem?.isDirectory,
        },
        {
          label: "Rename",
          action: () => handleRename(contextMenuTarget),
        },
        {
          label: "Delete",
          action: () => handleDelete(contextMenuTarget),
        },
        {
          label: "Create Shortcut",
          action: () => handleCreateShortcut(contextMenuTarget),
        },
      ];
    } else {
      // Background context menu
      return [
        {
          label: "New File",
          action: handleCreateFile,
        },
        {
          label: "New Folder",
          action: handleCreateFolder,
        },
        {
          label: "Refresh",
          action: refreshFiles,
        },
        {
          label: "Paste",
          action: () => console.log("Paste not implemented"),
          disabled: true,
        },
      ];
    }
  };

  // Render the explorer based on view mode
  const renderFilesList = () => {
    switch (viewMode) {
      case "list":
        return renderListView();
      case "details":
        return renderDetailsView();
      case "icons":
      default:
        return renderIconsView();
    }
  };

  // Render icons view (grid layout)
  const renderIconsView = () => {
    return (
      <div className={styles.iconsView}>
        {files.map((item) => (
          <div
            key={item.path}
            className={`${styles.fileItem} ${
              selectedFile === item.path ? styles.selected : ""
            }`}
            onClick={(e) => handleSelect(item.path, e)}
            onDoubleClick={() => handleDoubleClick(item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            <div className={styles.fileIcon}>
              <Image
                src={getFileIcon(item)}
                alt={item.isDirectory ? "Folder" : "File"}
                width={32}
                height={32}
              />
            </div>
            <div className={styles.fileName}>
              {isRenaming === item.path ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleSave}
                  autoFocus
                />
              ) : (
                item.name
              )}
            </div>
          </div>
        ))}

        {/* New file/folder input */}
        {(isCreatingFile || isCreatingFolder) && (
          <div className={`${styles.fileItem} ${styles.newItem}`}>
            <div className={styles.fileIcon}>
              <Image
                src={
                  isCreatingFile
                    ? "/assets/win98-icons/png/document-0.png"
                    : "/assets/win98-icons/png/directory_closed-0.png"
                }
                alt={isCreatingFile ? "New File" : "New Folder"}
                width={32}
                height={32}
              />
            </div>
            <div className={styles.fileName}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSave}
                placeholder={isCreatingFile ? "New File.txt" : "New Folder"}
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render list view (compact)
  const renderListView = () => {
    return (
      <div className={styles.listView}>
        {files.map((item) => (
          <div
            key={item.path}
            className={`${styles.listItem} ${
              selectedFile === item.path ? styles.selected : ""
            }`}
            onClick={(e) => handleSelect(item.path, e)}
            onDoubleClick={() => handleDoubleClick(item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            <div className={styles.listItemIcon}>
              <Image
                src={getFileIcon(item)}
                alt={item.isDirectory ? "Folder" : "File"}
                width={16}
                height={16}
              />
            </div>
            <div className={styles.listItemName}>
              {isRenaming === item.path ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleSave}
                  autoFocus
                />
              ) : (
                item.name
              )}
            </div>
          </div>
        ))}

        {/* New file/folder input */}
        {(isCreatingFile || isCreatingFolder) && (
          <div className={`${styles.listItem} ${styles.newItem}`}>
            <div className={styles.listItemIcon}>
              <Image
                src={
                  isCreatingFile
                    ? "/assets/win98-icons/png/document-0.png"
                    : "/assets/win98-icons/png/directory_closed-0.png"
                }
                alt={isCreatingFile ? "New File" : "New Folder"}
                width={16}
                height={16}
              />
            </div>
            <div className={styles.listItemName}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSave}
                placeholder={isCreatingFile ? "New File.txt" : "New Folder"}
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render details view (with columns)
  const renderDetailsView = () => {
    return (
      <div className={styles.detailsView}>
        <div className={styles.headerRow}>
          <div className={styles.nameColumn}>Name</div>
          <div className={styles.typeColumn}>Type</div>
          <div className={styles.sizeColumn}>Size</div>
          <div className={styles.dateColumn}>Modified</div>
        </div>

        <div className={styles.detailsList}>
          {files.map((item) => (
            <div
              key={item.path}
              className={`${styles.detailsItem} ${
                selectedFile === item.path ? styles.selected : ""
              }`}
              onClick={(e) => handleSelect(item.path, e)}
              onDoubleClick={() => handleDoubleClick(item)}
              onContextMenu={(e) => handleContextMenu(e, item)}
            >
              <div className={styles.nameColumn}>
                <Image
                  src={getFileIcon(item)}
                  alt=""
                  width={16}
                  height={16}
                  className={styles.detailsIcon}
                />
                {isRenaming === item.path ? (
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleSave}
                    autoFocus
                  />
                ) : (
                  item.name
                )}
              </div>
              <div className={styles.typeColumn}>
                {item.isDirectory
                  ? "Folder"
                  : item.isLink
                  ? "Shortcut"
                  : item.name.includes(".")
                  ? item.name.split(".").pop()?.toUpperCase() + " File"
                  : "File"}
              </div>
              <div className={styles.sizeColumn}>
                {item.isDirectory
                  ? ""
                  : item.size
                  ? formatFileSize(item.size)
                  : ""}
              </div>
              <div className={styles.dateColumn}>
                {item.modified ? formatDate(item.modified) : ""}
              </div>
            </div>
          ))}

          {/* New file/folder input */}
          {(isCreatingFile || isCreatingFolder) && (
            <div className={`${styles.detailsItem} ${styles.newItem}`}>
              <div className={styles.nameColumn}>
                <Image
                  src={
                    isCreatingFile
                      ? "/assets/win98-icons/png/document-0.png"
                      : "/assets/win98-icons/png/directory_closed-0.png"
                  }
                  alt=""
                  width={16}
                  height={16}
                  className={styles.detailsIcon}
                />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleSave}
                  placeholder={isCreatingFile ? "New File.txt" : "New Folder"}
                  autoFocus
                />
              </div>
              <div className={styles.typeColumn}>
                {isCreatingFile ? "File" : "Folder"}
              </div>
              <div className={styles.sizeColumn}></div>
              <div className={styles.dateColumn}></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper function to format file size
  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined) return "";

    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Helper function to format date
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Handle view mode change
  const handleViewModeChange = (mode: "icons" | "list" | "details") => {
    setViewMode(mode);
  };

  // If filesystem is not loaded
  if (!isLoaded) {
    return <div className={styles.loading}>Loading file system...</div>;
  }

  return (
    <div
      className={styles.fileExplorer}
      tabIndex={0}
      onKeyDown={handleKeyPress}
    >
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.navigationButtons}>
          <button
            className={styles.toolbarButton}
            onClick={navigateBack}
            disabled={historyIndex <= 0}
            title="Back"
          >
            &lt;
          </button>
          <button
            className={styles.toolbarButton}
            onClick={navigateForward}
            disabled={historyIndex >= history.length - 1}
            title="Forward"
          >
            &gt;
          </button>
          <button
            className={styles.toolbarButton}
            onClick={navigateUp}
            disabled={currentPath === "/"}
            title="Up"
          >
            Up
          </button>
        </div>

        <div className={styles.addressBar}>
          <span className={styles.addressLabel}>Address:</span>
          <div className={styles.addressInput}>{currentPath}</div>
        </div>

        <div className={styles.viewButtons}>
          <button
            className={`${styles.viewButton} ${
              viewMode === "icons" ? styles.active : ""
            }`}
            onClick={() => handleViewModeChange("icons")}
            title="Icons"
          >
            Icons
          </button>
          <button
            className={`${styles.viewButton} ${
              viewMode === "list" ? styles.active : ""
            }`}
            onClick={() => handleViewModeChange("list")}
            title="List"
          >
            List
          </button>
          <button
            className={`${styles.viewButton} ${
              viewMode === "details" ? styles.active : ""
            }`}
            onClick={() => handleViewModeChange("details")}
            title="Details"
          >
            Details
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div
        className={styles.contentArea}
        onClick={() => setSelectedFile(null)}
        onContextMenu={(e) => handleContextMenu(e)}
      >
        {files.length === 0 ? (
          <div className={styles.emptyFolder}>This folder is empty.</div>
        ) : (
          renderFilesList()
        )}
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          {selectedFile
            ? `Selected: ${selectedFile.split("/").pop()}`
            : `${files.length} item(s)`}
        </div>
      </div>

      {/* Context menu */}
      {showContextMenu && (
        <div
          className={styles.contextMenu}
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
        >
          {getContextMenuItems().map((item, index) => (
            <div
              key={index}
              className={`${styles.menuItem} ${
                item.disabled ? styles.disabled : ""
              }`}
              onClick={() => {
                if (!item.disabled) {
                  item.action();
                  setShowContextMenu(false);
                }
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileExplorerWindow;
function openWeatherApp(dispatch: React.Dispatch<DesktopAction>) {
  throw new Error("Function not implemented.");
}
