// src/components/desktop/Folder.tsx
import React, { useState, useRef, useEffect } from "react";
import { useSounds } from "@/hooks/useSounds";
import { useDesktop } from "@/context/DesktopContext";
import Image from "next/image";
import styles from "../styles/Icon.module.scss";

interface FolderProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  icon?: string;
  onDoubleClick: (e?: React.MouseEvent) => void;
}

const DEFAULT_FOLDER_ICON = '/assets/win98-icons/png/directory_closed-1.png';

// Folder colored icon as fallback
const FolderColoredIcon = () => {
  return (
    <div
      style={{
        width: "32px",
        height: "32px",
        backgroundColor: "#FFC83D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "4px",
        color: "#855B00",
        fontSize: "16px",
        fontWeight: "bold",
      }}
    >
      F
    </div>
  );
};

const Folder: React.FC<FolderProps> = ({
  id,
  title,
  position,
  icon = DEFAULT_FOLDER_ICON,
  onDoubleClick,
}) => {
  const { playSound } = useSounds();
  const { dispatch } = useDesktop();
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [iconError, setIconError] = useState(false);
  const [dragCounter, setDragCounter] = useState(0); // Counter for drag enter/leave events
  const folderRef = useRef<HTMLDivElement>(null);

  // Fix icon path
  const fixIconPath = (path: string): string => {
    if (!path) return DEFAULT_FOLDER_ICON;

    // Add leading slash if missing and not a URL
    if (!path.startsWith('/') && !path.startsWith('http')) {
      path = `/${path}`;
    }

    // Fix incorrect path structure
    path = path.replace('/assets/win98-icons/icons/', '/assets/win98-icons/');

    return path;
  };

  const finalIconSrc = fixIconPath(icon);

  // Handle folder double click - open folder window
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Double-clicked on ${title} folder`);
    playSound("click");

    // Open folder window
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: `folder-${id}`,
        title: title,
        minimized: false,
        position: { x: 100, y: 100 },
        size: { width: 500, height: 400 },
        type: "folder",
        zIndex: 1,
        content: {
          type: "folder",
          folderId: id,
        },
      },
    });
  };

  // Handle single click for selection
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Toggle selection with Ctrl key, otherwise select only this item
    const multiSelect = e.ctrlKey || e.shiftKey;

    setIsSelected(true);

    // In a real implementation, dispatch to selection manager
    // dispatch({ type: 'SELECT_ITEM', payload: { id, multiSelect } });
  };

  // Drag and drop handling
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(true);

    // Set folder as drag data
    e.dataTransfer.setData("application/retroos-icon-id", id);
    e.dataTransfer.setData("application/retroos-folder", JSON.stringify({ id, title }));
    e.dataTransfer.setData("text/plain", title);
    e.dataTransfer.effectAllowed = "move";

    // Set drag image
    if (folderRef.current) {
      try {
        const rect = folderRef.current.getBoundingClientRect();
        e.dataTransfer.setDragImage(
          folderRef.current,
          e.clientX - rect.left,
          e.clientY - rect.top
        );
      } catch (err) {
        console.warn("Failed to set drag image:", err);
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle drag enter and leave for visual feedback
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Increment counter to handle nested elements
    setDragCounter(prev => prev + 1);

    // Check if dragged item is not this folder
    const draggedId = e.dataTransfer.getData("application/retroos-icon-id");
    if (draggedId && draggedId !== id) {
      setIsDropTarget(true);
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Decrement counter, only remove highlight when all leaves are handled
    setDragCounter(prev => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setIsDropTarget(false);
        return 0;
      }
      return newCount;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only allow dropping if the dragged item is not this folder
    const draggedId = e.dataTransfer.getData("application/retroos-icon-id");
    if (draggedId && draggedId !== id) {
      e.dataTransfer.dropEffect = "move";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
    setDragCounter(0);

    // Get dragged item data
    const draggedId = e.dataTransfer.getData("application/retroos-icon-id");

    if (!draggedId || draggedId === id) return;

    console.log(`Moving item ${draggedId} to folder ${id}`);

    // Dispatch move action
    dispatch({
      type: "MOVE_ITEM",
      payload: {
        itemId: draggedId,
        newParentId: id,
      },
    });

    // Play sound for successful drop
    playSound("click");
  };

  return (
    <div
      ref={folderRef}
      className={`${styles.icon} ${isDragging ? styles.dragging : ""} ${isSelected ? styles.selected : ""} ${isDropTarget ? styles.dropTarget : ""}`}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: "80px",
        height: "90px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "center",
        cursor: isDragging ? "grabbing" : "pointer",
        // Add drop target style
        boxShadow: isDropTarget ? "0 0 0 2px #4a9eff" : "none",
        background: isDropTarget ? "rgba(74, 158, 255, 0.2)" : "transparent",
        borderRadius: "4px",
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-item-id={id}
      data-item-type="folder"
    >
      <div
        style={{
          marginBottom: "8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "40px",
          height: "40px",
        }}
      >
        {!iconError ? (
          <Image
            src={finalIconSrc}
            alt={title}
            width={32}
            height={32}
            style={{ objectFit: "contain" }}
            onError={() => {
              console.warn(`Using fallback for folder icon: ${finalIconSrc}`);
              setIconError(true);
            }}
            unoptimized
            loading="eager"
          />
        ) : (
          <FolderColoredIcon />
        )}
      </div>
      <div
        style={{
          width: "80px",
          maxHeight: "40px",
          overflow: "hidden",
          wordWrap: "break-word",
          textAlign: "center",
          color: "white",
          textShadow:
            "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black",
          fontSize: "12px",
          fontWeight: "bold",
          lineHeight: "1.2",
        }}
      >
        {title}
      </div>
    </div>
  );
};

export default Folder;