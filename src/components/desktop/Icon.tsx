// components/desktop/Icon.tsx
import React, { useState, useRef } from "react";
import styles from "../styles/Icon.module.scss";
import { useSounds } from "../../hooks/useSounds";
import Image from "next/image";

interface IconProps {
  icon: string;
  label: string;
  position: { x: number; y: number };
  onDoubleClick: (e?: React.MouseEvent) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id?: string) => void;
  itemId?: string; // ID of the item this icon represents
}

// Simple colored icon component as a fallback
const ColoredIcon = ({ letter }: { letter: string }) => {
  return (
    <div
      style={{
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
      }}
    >
      {letter}
    </div>
  );
};

const Icon: React.FC<IconProps> = ({
  icon,
  label,
  position,
  onDoubleClick,
  draggable = true,
  onDragStart,
  itemId,
}) => {
  const { playSound } = useSounds();
  const [iconError, setIconError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  // Handle double click with stopPropagation
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    console.log(`Double-clicked on ${label} icon`);
    playSound("click");
    onDoubleClick(e);
  };

  // Fix the icon path by ensuring it has the correct format
  const fixIconPath = (path: string): string => {
    // Check if path needs PNG extension
    if (
      !path.endsWith(".png") &&
      !path.endsWith(".ico") &&
      !path.endsWith(".jpg")
    ) {
      path = `${path}.png`;
    }

    // Add leading slash if missing
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }

    // Fix common path issues
    if (path.includes("assets/win98-icons/icons/png")) {
      // Remove extra 'icons/' part if present
      path = path.replace("icons/png", "png");
    }

    return path;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, itemId);
    } else {
      // Default drag behavior if no custom handler
      e.dataTransfer.setData("text/plain", itemId || label);
      e.dataTransfer.setData(
        "application/retroos-icon",
        JSON.stringify({
          id: itemId,
          label,
          icon,
        })
      );
    }

    setIsDragging(true);

    // If we have an element ref, use it as drag image
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        iconRef.current,
        e.clientX - rect.left,
        e.clientY - rect.top
      );
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Try to render normal img - if it fails, show colored fallback
  return (
    <div
      ref={iconRef}
      className={`${styles.icon} ${isDragging ? styles.dragging : ""}`}
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
      onDoubleClick={handleDoubleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-swapy-no-drag // Important: prevent Swapy from trying to drag this directly
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
            src={fixIconPath(icon)}
            alt={label}
            width={32}
            height={32}
            onError={(e) => {
              console.error(`Failed to load icon: ${icon}`);
              setIconError(true);
            }}
            style={{ objectFit: "contain" }}
          />
        ) : (
          <ColoredIcon letter={label.charAt(0).toUpperCase()} />
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
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          lineHeight: "1.2",
        }}
      >
        {label}
      </div>
    </div>
  );
};

export default Icon;
