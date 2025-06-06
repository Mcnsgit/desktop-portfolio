// src/components/desktop/Folder.tsx
import React, { useState } from "react";
// import { useSounds } from "@/hooks/useSounds"; // Keep if sounds are played directly here
// import { useDesktop } from "@/context/DesktopContext"; // To be removed
import Image, { StaticImageData } from "next/image";
import styles from "./Icon.module.scss"; // Assuming shared styles with Icon.tsx
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// --- Import New Model --- 
import { IDesktopItem, ItemType } from "../../../src/model/DesktopItem"; // Adjusted path
// import { Folder as ModelFolder } from "../../../src/model/Folder"; // Not directly used, IDesktopItem is sufficient

interface FolderProps {
  // id: string; // From item
  // title: string; // From item.name
  item: IDesktopItem; // Should be ModelFolder ideally, but IDesktopItem is the base
  position: { x: number; y: number };
  icon?: string | StaticImageData; // From item.icon, but can be overridden by prop
  onDoubleClick: (e?: React.MouseEvent) => void; // Passed from Desktop.tsx
  isSelected: boolean;
  onItemClick: (e: React.MouseEvent, itemId: string) => void;
  isCut?: boolean;
  // type: "folder"; // From item.type
  // parentId?: string | null; // From item.parentId
  path?: string; // May still be needed for specific FS operations not in model
}

const DEFAULT_FOLDER_ICON = '/assets/win98-icons/png/directory_closed-1.png';

const FolderColoredIconFallback = () => (
  <div style={{
    width: "32px", height: "32px", backgroundColor: "#FFC83D",
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "4px", color: "#855B00", fontSize: "16px", fontWeight: "bold",
  }}>F</div>
);

const Folder: React.FC<FolderProps> = ({
  item,
  position,
  icon: iconProp, // Prop can override item.icon
  onDoubleClick,
  isSelected,
  onItemClick,
  isCut,
  path, // Keep path if it's used for something beyond model's scope
}) => {
  // const { playSound } = useSounds(); // Keep if used
  // const { dispatch } = useDesktop(); // Remove
  const [iconError, setIconError] = useState(false);

  const { id, name: title, type, icon: modelIcon, parentId } = item;
  const displayIcon = iconProp || modelIcon || DEFAULT_FOLDER_ICON;

  const {
    attributes,
    listeners,
    setNodeRef: draggableSetNodeRef, // Rename to avoid conflict
    transform,
    isDragging,
  } = useDraggable({
    id: id,
    data: {
      id,
      title,
      type: type as ItemType, // Ensure it uses the ItemType
      originalPosition: position,
      parentId,
      isCut,
      path, // Pass path if it's part of draggable data
    },
  });

  const { setNodeRef: droppableSetNodeRef, isOver, active } = useDroppable({
    id: id, // Folder itself is a droppable target
    data: {
      type: "folder", // Important for dnd-kit logic
      folderId: id,
      path: path, // Pass path if relevant for drop logic
    },
  });

  // Combine refs for draggable and droppable
  const combinedRef = (node: HTMLDivElement | null) => {
    draggableSetNodeRef(node);
    droppableSetNodeRef(node);
  };

  const fixIconPath = (pathInput: string | StaticImageData): string | StaticImageData => {
    if (typeof pathInput !== 'string') return pathInput;
    let pathStr = pathInput;
    if (!pathStr) return DEFAULT_FOLDER_ICON;
    if (!pathStr.startsWith('/') && !pathStr.startsWith('http')) pathStr = `/${pathStr}`;
    // pathStr = pathStr.replace('/assets/win98-icons/icons/', '/assets/win98-icons/'); // Example, review if needed
    const hasExtension = /\.(png|ico|jpg|jpeg|svg|webp)$/i.test(pathStr);
    if (!hasExtension && !pathStr.includes('data:image')) pathStr = `${pathStr}.png`;
    return pathStr;
  };

  const finalIconSrc = fixIconPath(displayIcon);

  const handleDoubleClickLocal = (e: React.MouseEvent) => {
    if (isDragging) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    // playSound("windowOpen"); // Sound will be played by Desktop.tsx or model action
    onDoubleClick(e); // Call the prop passed from Desktop.tsx
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
    // transition: isDragging ? 'none' : 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out', // Smooth transition
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
      data-item-type={type} // Use type from item model
    >
      <div
        className={styles.iconImageContainer} // Using class from Icon.module.scss
        style={{ marginBottom: "5px"}} // Keep specific folder layout adjustments
      >
        {!iconError ? (
          <Image
            src={finalIconSrc}
            alt={title} // item.name
            width={32}
            height={32}
            style={{ objectFit: "contain" }}
            onError={() => {
              console.warn(`Folder.tsx: Error loading icon, using fallback for: ${finalIconSrc}`);
              setIconError(true);
            }}
            unoptimized
            loading="eager"
          />
        ) : (
          <FolderColoredIconFallback />
        )}
      </div>
      <div className={styles.iconLabel}>{title}</div>
    </div>
  );
};

export default Folder;