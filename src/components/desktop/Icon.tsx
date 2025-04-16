// components/desktop/Icon.tsx
import React, { useState, useRef } from "react";
import styles from "../styles/Icon.module.scss";
import { useSounds } from "../../hooks/useSounds";
import Image, { StaticImageData } from "next/image"; // Added StaticImageData


interface IconProps {
  icon: string | StaticImageData;
  label: string;
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
  const handleDoubleClickInternal = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    console.log(`Double-clicked on ${label} icon`);
    playSound("click");
    onDoubleClick(e);
  };

  // Fix the icon path by ensuring it has the correct format
  const fixIconPath = (pathInput: string | StaticImageData): string | StaticImageData => {
    if (typeof pathInput !== 'string') {
        return pathInput; // Return if already StaticImageData
    }
    let path = pathInput;
    if (!path) return '/assets/win98-icons/png/application-0.png'; // Default icon path

    if (!path.startsWith('/') && !path.startsWith('http')) { path = `/${path}`; } // Add leading slash if missing and not URL

    // Basic extension check (can be expanded)
    const hasExtension = /\.(png|ico|jpg|jpeg|svg|webp)$/i.test(path);
    if (!hasExtension && !path.includes('data:image')) { // Don't add png to data URIs
        path = `${path}.png`; // Default to png if no extension
    }
    // Path cleaning (adjust based on actual project structure)
    path = path.replace('/icons/png/', '/png/'); // Example cleaning

    return path;
  };


  const handleDragStartInternal = (e: React.DragEvent) => { // Use DragEvent type
    if (onDragStart) {
      onDragStart(e, itemId);
    } else if (itemId) {
      e.dataTransfer.setData("application/retroos-icon-id", itemId);
      e.dataTransfer.effectAllowed = "move";
      if (iconRef.current) {
        const rect = iconRef.current.getBoundingClientRect();
        const offsetX = Math.max(0, e.clientX - rect.left); // Ensure non-negative offset
        const offsetY = Math.max(0, e.clientY - rect.top);
        try { // Add try-catch for setDragImage which can fail in some contexts
            e.dataTransfer.setDragImage(iconRef.current, offsetX, offsetY);
        } catch (err) {
            console.warn("setDragImage failed:", err);
        }
      }
    } else {
        // Prevent dragging if no itemId and no custom handler
        // e.preventDefault(); // Optionally prevent drag start
        console.warn("Icon drag started without itemId and onDragStart handler.");
    }
    setIsDragging(true);
  };

  const handleDragEndInternal = () => { setIsDragging(false); };

  // *** FIX: Use the result of fixIconPath ***
  const finalIconSrc = fixIconPath(icon);

  return (
    <div
      ref={iconRef}
      className={`${styles.icon} ${isDragging ? styles.dragging : ""}`}
      style={{ /* ... styles remain same (no position) ... */
         width: "80px", height: "90px", display: "flex", flexDirection: "column",
         alignItems: "center", justifyContent: "flex-start", textAlign: "center",
         cursor: isDragging ? "grabbing" : "pointer",
      }}
      onDoubleClick={handleDoubleClickInternal}
      draggable={draggable && !!itemId} // Only draggable if intended AND has an ID
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      data-item-id={itemId}
    >
      <div style={{ /* ... icon image wrapper styles ... */
          marginBottom: "8px", display: "flex", justifyContent: "center",
          alignItems: "center", width: "40px", height: "40px",
      }}>
        {/* *** FIX: Check iconError state, pass finalIconSrc, fix alt *** */}
        {!iconError && finalIconSrc ? (
          <Image
            src={finalIconSrc}
            alt={label} // Use label for alt text
            width={32}
            height={32}
            onError={() => {
              console.error(`Failed to load icon: `, finalIconSrc);
              setIconError(true);
            }}
            style={{ objectFit: "contain" }}
            unoptimized // Good practice for potentially dynamic/external paths
          />
        ) : (
          <ColoredIcon letter={label.charAt(0).toUpperCase()} />
        )}
      </div>
      <div style={{ /* ... label styles ... */
         width: "80px", maxHeight: "40px", overflow: "hidden", wordWrap: "break-word",
         textAlign: "center", color: "white", textShadow: "1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black",
         fontSize: "12px", fontFamily: "Arial, sans-serif", fontWeight: "bold", lineHeight: "1.2",
       }}>
        {label}
      </div>
    </div>
  );
};

export default Icon;