// src/components/desktop/Icon.tsx
import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
// import { useSounds } from "@/hooks/useSounds";
import Image, { StaticImageData } from "next/image";
import styles from "./Icon.module.scss";

// --- Import New Model --- 
import { IDesktopItem } from "../../../src/model/DesktopItem"; // Assuming path is correct

interface IconProps {
  // id: string; // From item model
  // icon: string | StaticImageData; // From item model
  // title: string; // From item model (name)
  // type: string; // From item model
  item: IDesktopItem;
  position: { x: number; y: number }; // Position is UI-specific
  onDoubleClick: () => void; // Action from Desktop.tsx
  isSelected: boolean;
  onItemClick: (e: React.MouseEvent, itemId: string) => void;
  isCut?: boolean; // UI state, passed from Desktop.tsx
  // parentId?: string | null; // From item model
}

const Icon: React.FC<IconProps> = ({
  // id, // Destructure from item
  // title,
  // type,
  item,
  position,
  // icon, // Destructure from item
  onDoubleClick,
  isSelected,
  onItemClick,
  isCut,
  // parentId // Destructure from item
}) => {
  const { id, name: title, type, icon, parentId } = item; // Destructure from item model

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id, // Use id from item
    data: {
      id,
      title, // title is item.name
      type,  // type from item
      originalPosition: position,
      parentId, // parentId from item
      isCut
    },
  });

  const [iconError, setIconError] = useState(false);

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    position: 'absolute' as 'absolute', // Ensure 'absolute' is literal type
    left: position.x,
    top: position.y,
    opacity: isCut ? 0.6 : (isDragging ? 0.5 : 1),
    zIndex: isDragging ? 1000 : undefined,
    cursor: isDragging ? 'grabbing' : 'pointer',
    width: "80px", // Consider making these configurable or part of styles
    height: "90px",
  } : {
    position: 'absolute' as 'absolute',
    left: position.x,
    top: position.y,
    opacity: isCut ? 0.6 : 1,
    cursor: 'pointer',
    width: "80px",
    height: "90px",
  };

  const fixIconPath = (pathInput: string | StaticImageData): string | StaticImageData => {
    if (typeof pathInput !== 'string') {
      return pathInput;
    }
    let path = pathInput;
    if (!path) return '/assets/icons/win98/png/directory_open_cool-2.png'; // Default fallback
    if (!path.startsWith('/') && !path.startsWith('http')) {
      path = `/${path}`;
    }
    // Example: path = path.replace('/assets/icons/win98/png/','/assets/win98-icons/png/');
    // Make sure this replace is still relevant or generalized
    const hasExtension = /\.(png|ico|jpg|jpeg|svg|webp)$/i.test(path);
    if (!hasExtension && !path.includes('data:image')) {
      path = `${path}.png`; // Attempt to add .png if no extension
    }
    return path;
  };

  const finalIconSrc = icon ? fixIconPath(icon) : '/assets/icons/win98/png/file_lines-0.png'; // Use item.icon

  const ColoredIconFallback = () => (
    <div className={styles.fallbackIcon}>
      {title.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      style={style as React.CSSProperties}
      {...listeners}
      {...attributes}
      className={`${styles.icon} ${isSelected ? styles.selected : ""} ${isCut ? styles.cut : ""} ${isDragging ? styles.dragging : ""}`}
      onClick={(e) => {
        if (isDragging) return;
        onItemClick(e, id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (isDragging) return;
        onDoubleClick(); // This will be connected to model.handleDoubleClick in Desktop.tsx
      }}
      data-item-id={id}
      data-item-type={type}
    >
      <div className={styles.iconImageContainer}>
        {!iconError && finalIconSrc ? (
          <Image
            src={finalIconSrc}
            alt={title} // Use item.name (as title)
            width={32}
            height={32}
            onError={() => {
              console.warn(`Icon.tsx: Error loading icon, using fallback for: ${finalIconSrc}`);
              setIconError(true);
            }}
            style={{ objectFit: "contain" }}
            unoptimized // Consider if this is always needed
            loading="eager" // Consider if this is always needed
          />
        ) : (
          <ColoredIconFallback />
        )}
      </div>
      <div className={styles.iconLabel}>
        {title} {/* Use item.name (as title) */}
      </div>
    </div>
  );
};

export default Icon;