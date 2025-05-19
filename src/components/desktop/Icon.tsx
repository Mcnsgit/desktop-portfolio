// src/components/desktop/Icon.tsx
import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
// import { useSounds } from "@/hooks/useSounds";
import Image, { StaticImageData } from "next/image";
import styles from "./Icon.module.scss";

interface IconProps {
  id: string;
  title: string;
  type: string;
  position: { x: number; y: number };
  icon: string | StaticImageData;
  onDoubleClick: () => void;
  isSelected: boolean;
  onItemClick: (e: React.MouseEvent, itemId: string) => void;
  isCut?: boolean;
  parentId?: string | null;
}

const Icon: React.FC<IconProps> = ({
  id,
  title,
  type,
  position,
  icon,
  onDoubleClick,
  isSelected,
  onItemClick,
  isCut,
  parentId
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: {
      id,
      title,
      type,
      originalPosition: position,
      parentId,
      isCut
    },
  });

  const [iconError, setIconError] = useState(false);

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    position: 'absolute',
    left: position.x,
    top: position.y,
    opacity: isCut ? 0.6 : (isDragging ? 0.5 : 1),
    zIndex: isDragging ? 1000 : undefined,
    cursor: isDragging ? 'grabbing' : 'pointer',
    width: "80px",
    height: "90px",
  } : {
    position: 'absolute',
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
    if (!path) return '/assets/icons/win98/png/directory_open_cool-2.png';
    if (!path.startsWith('/') && !path.startsWith('http')) {
      path = `/${path}`;
    }
    path = path.replace('/assets/icons/win98/png/','/assets/win98-icons/png/');
    const hasExtension = /\.(png|ico|jpg|jpeg|svg|webp)$/i.test(path);
    if (!hasExtension && !path.includes('data:image')) {
      path = `${path}.png`;
    }
    return path;
  };

  const finalIconSrc = fixIconPath(icon);

  const ColoredIcon = () => (
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
        onDoubleClick();
      }}
      data-item-id={id}
      data-item-type={type}
    >
      <div className={styles.iconImageContainer}>
        {!iconError && finalIconSrc ? (
          <Image
            src={finalIconSrc}
            alt={title}
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
      <div className={styles.iconLabel}>
        {title}
      </div>
    </div>
  );
};

export default Icon;