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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);


const toggleCategory = (category: string) => {
  playSound("click");
  setActiveCategory(current => (current === category ? null : category));
};

  // Find the currently active window. On mobile, we only show one at a time.
  const activeWindow = windows.find(win => win.isActive) || (windows.length > 0 ? windows[0] : null);
  // If a window is open, render the "App View"
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

  // Otherwise, render the "Home Screen"
  const mainIcons = desktopFiles.filter(f =>
    [FileType.ABOUT, FileType.CONTACT, FileType.EDUCATION, FileType.COMPONENT].includes(f.type) && f.id !== 'gameoflife'

  )
  .map(file => ({
    ...file,
    isActive: file.id === activeCategory,
  }));


  return (
    <div className={styles.mobileView}>
      <div className={styles.header}>
        <div className={styles.windowHeader}>
          <div className={styles.windowTitle}>RetroOS Portfolio</div>
        </div>
      </div>

      <div className={styles.mainIcons}>
        <div className={styles.categoryButtons}>
          <button onClick={() => toggleCategory("about")}>About</button>
          <button onClick={() => toggleCategory("contact")}>Contact</button>
          <button onClick={() => toggleCategory("education")}>Education</button>
          <button onClick={() => toggleCategory("projects")}>Projects</button>
        </div>

        <div className={styles.iconGrid}>
          {mainIcons.map(file => (
            <div key={file.id} className={styles.iconItem} onClick={() => onOpenWindow(file)}>
              <div className={styles.iconWrapper}>
                <Image src={file.icon} width={32} height={32} alt={file.name} className={styles.icon} />
              </div>
              <span>{file.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.projectSection}>
        <h2>Projects</h2>
        <div className={styles.projectGrid}>
          {portfolioProjects.map(project => (
            <div
              key={project.id}
              className={styles.projectCard}
              onClick={() => onOpenWindow(project)}
            >
              <div className={styles.projectCardHeader}>
                <Image src={project.icon} alt={project.name} width={24} height={24} />
                <h3>{project.name}</h3>
              </div>
              <p>{project.data.description?.slice(0, 70)}...</p>
              <div className={styles.projectTech}>
                {project.data.technologies?.slice(0, 3).map(tech => (
                  <span key={tech} className={styles.techBadge}>{tech}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        RetroOS © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default MobileView;