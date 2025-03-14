import React, { useState, useRef } from "react";
import { useSounds } from "@/hooks/useSounds";
import { useDesktop } from "@/context/DesktopContext";
import styles from "../styles/Icon.module.scss";
import { center } from "maath/dist/declarations/src/buffer";

interface FolderProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, folderId: string) => void;
}

const Folder: React.FC<FolderProps> = ({
  id,
  title,
  position,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const { playSound } = useSounds();
  const { dispatch } = useDesktop();
  const [isDragging, setIsDragging] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);

  //double click to open folder

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Double-clicked on ${title} folder`);
    playSound("click");

    //open fiolder window
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: `folder-${id}`,
        title: title,
        content: id,
        minimized: false,
        position: { x: 100, y: 100 },
        size: { width: 500, height: 400 },
        type: "folder",
      },
    });
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, id);
      setIsDragging(true);
      //set drag imnage and data
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.setData(
        "application/retros-folder",
        JSON.stringify({ id, title })
      );

      //if we have an element ref, use it aas drag unage
      if (folderRef.current) {
        const rect = folderRef.current.getBoundingClientRect();
        e.dataTransfer.setDragImage(
          folderRef.current,
          e.clientX - rect.left,
          e.clientY - rect.top
        );
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (onDragOver) {
      e.preventDefault(); //to allow dropping
      onDragOver(e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (onDrop) {
      e.preventDefault();
      onDrop(e, id);
    }
  };

  return (
    <div
      ref={folderRef}
      className={`${styles.icon} ${isDragging ? styles.dragging : ""}`}
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
        cursor: "pointer",
      }}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDoubleClick={handleDoubleClick}
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
        <img
          src="/assets/win98-icons/png/directory_closed-1.png"
          alt={title}
          width={32}
          height={32}
          style={{ objectFit: "contain" }}
        />
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
