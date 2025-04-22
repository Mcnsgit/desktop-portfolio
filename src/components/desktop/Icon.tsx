// src/components/desktop/Icon.tsx
import React, { useState, useRef, useEffect } from "react";
import { useSounds } from "@/hooks/useSounds";
import { useDesktop } from "@/context/DesktopContext";
import Image, { StaticImageData } from "next/image";
import styles from "../styles/Icon.module.scss";

interface IconProps {
  icon: string | StaticImageData;
  label: string;
  itemId: string;
  onDoubleClick: () => void;
}

const Icon: React.FC<IconProps> = ({
  icon,
  label,
  itemId,
  onDoubleClick,
}) => {
  const { playSound } = useSounds();
  const { state, dispatch } = useDesktop();
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  // Check if this item is in the selection
  useEffect(() => {
    // This would come from a selection context or manager
    // For now, just check if active item matches this one
    setIsSelected(state.activeWindowId === itemId);
  }, [state.activeWindowId, itemId]);

  // Handle double click
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound("click");
    onDoubleClick();
  };

  // Handle single click for selection
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Handle multi-selection with Ctrl/Shift keys
    const multiSelect = e.ctrlKey || e.shiftKey;

    // This would dispatch to a selection manager
    // For now, just simulate selection
    setIsSelected(true);

    // Dispatch to global state if needed
    // dispatch({ type: 'SELECT_ITEM', payload: { id: itemId, multiSelect } });
  };

  // Drag and drop handling
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(true);

    // Set drag data
    e.dataTransfer.setData("application/retroos-icon-id", itemId);
    e.dataTransfer.setData("text/plain", label);
    e.dataTransfer.effectAllowed = "move";

    // Set drag image
    if (iconRef.current) {
      try {
        const rect = iconRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        e.dataTransfer.setDragImage(iconRef.current, offsetX, offsetY);
      } catch (err) {
        console.warn("Failed to set drag image:", err);
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Fix icon path for display
  const fixIconPath = (pathInput: string | StaticImageData): string | StaticImageData => {
    if (typeof pathInput !== 'string') {
      return pathInput;
    }

    let path = pathInput;

    // Default icon if not provided
    if (!path) return '/assets/win98-icons/png/application-0.png';

    // Add leading slash if missing and not a URL
    if (!path.startsWith('/') && !path.startsWith('http')) {
      path = `/${path}`;
    }

    // Fix incorrect path structure (remove extra "icons" directory)
    path = path.replace('/assets/win98-icons/icons/', '/assets/win98-icons/');

    // Add extension if missing
    const hasExtension = /\.(png|ico|jpg|jpeg|svg|webp)$/i.test(path);
    if (!hasExtension && !path.includes('data:image')) {
      path = `${path}.png`;
    }

    return path;
  };

  const finalIconSrc = fixIconPath(icon);

  // Fallback icon if image fails to load
  const [iconError, setIconError] = useState(false);

  // ColoredIcon as fallback
  const ColoredIcon = () => (
    <div style={{
      width: "32px",
      height: "32px",
      backgroundColor: "#1e90ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "4px",
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
    }}>
      {label.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div
      ref={iconRef}
      className={`${styles.icon} ${isDragging ? styles.dragging : ""} ${isSelected ? styles.selected : ""}`}
      style={{
        width: "80px",
        height: "90px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "center",
        cursor: isDragging ? "grabbing" : "pointer",
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-item-id={itemId}
    >
      <div style={{
        marginBottom: "8px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "40px",
        height: "40px",
      }}>
        {!iconError && finalIconSrc ? (
          <Image
            src={finalIconSrc}
            alt={label}
            width={32}
            height={32}
            onError={() => {
              console.warn(`Using fallback for icon: ${finalIconSrc}`);
              setIconError(true);
            }}
            style={{ objectFit: "contain" }}
            unoptimized
            loading="eager"
          />
        ) : (
          <ColoredIcon />
        )}
      </div>
      <div style={{
        width: "80px",
        maxHeight: "40px",
        overflow: "hidden",
        wordWrap: "break-word",
        textAlign: "center",
        color: "white",
        textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black",
        fontSize: "12px",
        fontWeight: "bold",
        lineHeight: "1.2",
      }}>
        {label}
      </div>
    </div>
  );
};

export default Icon;