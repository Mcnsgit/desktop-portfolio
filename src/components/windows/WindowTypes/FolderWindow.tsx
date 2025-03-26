import React, { useMemo } from "react";
import { useDesktop } from "../../../context/DesktopContext";
import Icon from "../../desktop/Icon";
import Folder from "@/components/desktop/Folder";
import styles from "../../styles/FolderWindow.module.scss";

interface FolderWindowProps {
  folderId: string;
}
const FolderWindow: React.FC<FolderWindowProps> = ({ folderId }) => {
  const { state, dispatch } = useDesktop();

  // Find the folder by ID
  const folder = useMemo(() => {
    return state.folders.find((folder) => folder.id === folderId);
  }, [state.folders, folderId]);

  // Get items in this folder
  const folderItems = useMemo(() => {
    if (!folder) return [];
    return state.desktopItems.filter((item) => item.parentId === folderId);
  }, [state.desktopItems, folder, folderId]);

  // Handle drag events
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/plain", itemId);
    // Store the source folder ID to track moves between folders
    e.dataTransfer.setData("source-folder", folderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    const sourceFolder = e.dataTransfer.getData("source-folder");

    // Get drop position relative to the folder window content
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const dropX = Math.max(0, e.clientX - left);
    const dropY = Math.max(0, e.clientY - top);

    // If the item is coming from another folder or the desktop
    if (itemId && (!sourceFolder || sourceFolder !== folderId)) {
      dispatch({
        type: "MOVE_ITEM",
        payload: {
          itemId,
          newParentId: folderId,
          position: { x: dropX, y: dropY },
        },
      });
    }
    // If the item is already in this folder, just update its position
    else if (itemId) {
      dispatch({
        type: "UPDATE_ITEM_POSITION",
        payload: {
          itemId,
          position: { x: dropX, y: dropY },
        },
      });
    }
  };

  // Handle double click on an item
  const handleItemDoubleClick = (
    itemId: string,
    itemType: "project" | "folder"
  ) => {
    // For project items
    if (itemType === "project") {
      const project = state.projects.find((p) => p.id === itemId);
      if (project) {
        dispatch({
          type: "OPEN_WINDOW",
          payload: {
            id: `project-${project.id}`,
            title: project.title,
            content: { type: "project", projectId: project.id },
            minimized: false,
            position: { x: 100, y: 100 },
            size: { width: 500, height: 400 },
            type: "project",
          },
        });
      }
    }
    // For folder items
    else if (itemType === "folder") {
      const subfolder = state.folders.find((f) => f.id === itemId);
      if (subfolder) {
        dispatch({
          type: "OPEN_WINDOW",
          payload: {
            id: `folder-${subfolder.id}`,
            title: subfolder.title,
            content: { type: "folder", folderId: subfolder.id },
            minimized: false,
            position: { x: 120, y: 120 },
            size: { width: 500, height: 400 },
            type: "folder",
          },
        });
      }
    }
  };

  // Arrange items in a grid
  const renderItems = () => {
    const GRID_COLUMN_WIDTH = 100;
    const GRID_ROW_HEIGHT = 120;
    const GRID_COLUMNS = 5;

    return folderItems.map((item, index) => {
      const col = Math.floor(index % GRID_COLUMNS);
      const row = Math.floor(index / GRID_COLUMNS);
      const position = {
        x: 20 + col * GRID_COLUMN_WIDTH,
        y: 20 + row * GRID_ROW_HEIGHT,
      };

      if (item.type === "folder") {
        return (
          <Folder
            key={item.id}
            id={item.id}
            title={item.title}
            position={position}
            onDoubleClick={() => handleItemDoubleClick(item.id, "folder")}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        );
      } else {
        // Find the corresponding project
        const project = state.projects.find((p) => p.id === item.id);
        if (!project) return null;

        return (
          <Icon
            key={item.id}
            position={position}
            icon={project.icon}
            label={project.title}
            onDoubleClick={() => handleItemDoubleClick(item.id, "project")}
            draggable={true}
            onDragStart={(e: React.DragEvent) => handleDragStart(e, item.id)}
            itemId={item.id}
          />
        );
      }
    });
  };

  // If folder doesn't exist anymore
  if (!folder) {
    return (
      <div className={styles.folderWindow}>
        <div className={styles.error}>Folder not found</div>
      </div>
    );
  }

  return (
    <div
      className={styles.folderWindow}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={styles.header}>
        <div className={styles.path}>
          {/* Show breadcrumb navigation if needed */}
          {folder.parentId ? `../${folder.title}` : folder.title}
        </div>
      </div>

      <div className={styles.folderContent}>
        {folderItems.length === 0 ? (
          <div className={styles.emptyFolder}>
            This folder is empty. Drag and drop items here.
          </div>
        ) : (
          renderItems()
        )}
      </div>
    </div>
  );
};

export default FolderWindow;
