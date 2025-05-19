// src/components/desktop/Folder.tsx
import React, { useState } from "react";
import { useSounds } from "@/hooks/useSounds";
import { useDesktop } from "@/context/DesktopContext";
import Image from "next/image";
import styles from "./Icon.module.scss"
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface FolderProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  icon?: string;
  onDoubleClick: (e?: React.MouseEvent) => void;
  isSelected: boolean;
  onItemClick: (e: React.MouseEvent, itemId: string) => void;
  isCut?: boolean;
  type: "folder";
  parentId?: string | null;
  path?: string;
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
  // onDoubleClick,
  isSelected,
  onItemClick,
  isCut,
  parentId,
  path,
}) => {
  const { playSound } = useSounds();
  const { dispatch } = useDesktop();
  const [iconError, setIconError] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: id,
    data: {
      id,
      title,
      type: "folder",
      originalPosition: position,
      parentId,
      isCut,
      path,
    },
  });

  const { setNodeRef: droppableSetNodeRef, isOver, active } = useDroppable({
    id: id,
    data: {
      type: "folder",
      folderId: id,
      path: path,
    },
  });

  const combinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    droppableSetNodeRef(node);
  };

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
  const handleDoubleClickLocal = (e: React.MouseEvent) => {
    if (isDragging) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    playSound("windowOpen");
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

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.stopPropagation();
      return;
    }
    onItemClick(e, id);
  };

  const style: React.CSSProperties = {
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
    borderRadius: "4px",
    opacity: isDragging ? 0.8 : isCut ? 0.6 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  if (transform) {
    style.transform = CSS.Translate.toString(transform);
  }

  const isDropTarget = isOver && active && active.id !== id;

  return (
    <div
      ref={combinedRef}
      {...attributes}
      {...listeners}
      className={`${styles.icon} ${isDragging ? styles.dragging : ""} ${isSelected ? styles.selected : ""} ${isCut ? styles.cut : ""} ${isDropTarget ? styles.dropTarget : ""}`}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClickLocal}
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