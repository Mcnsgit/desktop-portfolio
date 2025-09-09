// src/components/mobile/MobileView.tsx
import React, { useState } from "react";
import styles from "./MobileView.module.scss";
import Image from "next/image";
import { useSounds } from "@/hooks/useSounds";
import { DesktopFile, FileType } from "@/types/fs";
import { WindowProps } from "@/types/window";
import { portfolioProjects } from "@/config/data";
import { X } from "lucide-react";

interface MobileViewProps {
  windows: WindowProps[];
  desktopFiles: DesktopFile[];
  onOpenWindow: (file: DesktopFile) => void;
  onCloseWindow: (id: string) => void;
}

const MobileView: React.FC<MobileViewProps> = ({ windows, desktopFiles, onOpenWindow, onCloseWindow }) => {
  const { playSound } = useSounds();
  const [activeCategory, setActiveCategory] = useState<string | null>('about'); // Default to 'about' open

  const toggleCategory = (category: string) => {
    playSound("click");
    setActiveCategory(current => (current === category ? null : category));
  };

  const activeWindow = windows.find(win => win.isActive) || (windows.length > 0 ? windows[0] : null);

  if (activeWindow) {
    return (
      <div className={styles.mobileWindowOverlay}>
        <div className={styles.mobileWindowHeader}>
          <div className={styles.title}>{activeWindow.title}</div>
          <button onClick={() => onCloseWindow(activeWindow.id)} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.mobileWindowContent}>
          {activeWindow.content}
        </div>
      </div>
    );
  }

  const renderCategory = (title: string, files: DesktopFile[]) => (
    <div key={title} className={styles.categorySection}>
      <button onClick={() => toggleCategory(title.toLowerCase())} className={styles.categoryHeader}>
        <h3>{title}</h3>
        <span>{activeCategory === title.toLowerCase() ? '▼' : '▶'}</span>
      </button>
      {activeCategory === title.toLowerCase() && (
        <div className={styles.categoryContent}>
          {files.map(file => (
            <div key={file.id} className={styles.fileItem} onClick={() => onOpenWindow(file)}>
              <Image src={file.icon} width={24} height={24} alt={file.name} />
              <span>{file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.mobileView}>
      <div className={styles.header}>
        <div className={styles.windowHeader}>
          <div className={styles.windowTitle}>RetroOS Portfolio</div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {renderCategory('About', desktopFiles.filter(f => [FileType.ABOUT, FileType.CONTACT, FileType.EDUCATION].includes(f.type)))}
        {renderCategory('Projects', portfolioProjects)}
        {renderCategory('Applications', desktopFiles.filter(f => f.type === FileType.COMPONENT && f.id !== 'gameoflife'))}
      </div>

      <footer className={styles.footer}>
        RetroOS © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default MobileView;