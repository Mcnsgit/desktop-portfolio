// src/components/desktop/Taskbar.tsx
import React, { useState, useEffect, useCallback } from "react";
import styles from "./Taskbar.module.scss";
import Image from "next/image";
import clock from "../../../public/assets/icons/Clock.png";
import defaultApp from "../../../public/assets/icons/default-application.png";
import startMenuIconAsset from "../../../public/assets/icons/start-menu.png";
import {WindowProps} from "../../types/window";
import { desktopFiles, StartMenuItems } from "@/config/data";
import StartMenu from "./StartMenu";

interface TaskbarProps {
  openWindows: WindowProps[];
  onTaskbarItemClick: (id: string) => void;
}
const Taskbar: React.FC<TaskbarProps> = ({ openWindows, onTaskbarItemClick }) => {
  const [currentTime, setCurrentTime] = useState<string>("");
   const [currentDate, setCurrentDate] = useState<string>("");
   const [isStartMenuOpen, setIsStartMenuOpen] = useState<boolean>(false);

  const updateClock = useCallback(() => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setCurrentDate(now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }));
  }, []);

  useEffect(() => {
    updateClock();
    const timerId = setInterval(updateClock, 1000 * 30); // Update every 30 seconds
    return () => clearInterval(timerId);
  }, [updateClock]);
  
  const handleStartMenuAction = (payload: any) => {
      // Find the full file object from all possible files
      const allFiles = [...desktopFiles, ...StartMenuItems];
      const fileToOpen = allFiles.find(f => f.id === payload.id);
      if (fileToOpen) {
        onTaskbarItemClick(fileToOpen.id);
      }
  };



  return (
    <div className={styles.toolbarOuter}>
      <div className={styles.toolbarInner}>
        <div className={styles.toolbar}>
          <div
            className={`${styles.startContainerOuter}`}
            onClick={() => {
              setIsStartMenuOpen(!isStartMenuOpen);
            }}
          >
            <div className={`${styles.startContainer}`}>
              <Image src={startMenuIconAsset} alt="Start" width={18} height={18} className={styles.startIcon} />
              <p className={styles.startButtonText}>Start</p>
              {isStartMenuOpen && (
              <StartMenu
                isOpen={isStartMenuOpen}
                onClose={() => setIsStartMenuOpen(false)}
                onAction={handleStartMenuAction}
              />
              )}
            </div>
          </div>
          <div className={styles.toolbarTabsContainer}>
            {openWindows.map((window) => (
              <div
                key={window.id}
                className={`${styles.tabContainerOuter} ${window.isActive ? styles.activeTabOuter : ''}`}
                  onMouseDown={() => onTaskbarItemClick(window.id)}
              >
                <div className={`${styles.tabContainer} ${window.isActive ? styles.activeTabInner : ''}`}>
                  <Image
                    src={desktopFiles.find(file => file.id === window.id)?.icon || defaultApp}
                    alt={window.title}
                    width={16}
                    height={16}
                    className={styles.tabIcon}
                  />
                  <p className={styles.tabText}>{window.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.time} title={currentDate}>
          <Image src={clock} alt="Clock" width={14} height={14} className={styles.timeIcon} />
          <p className={styles.timeText}>{currentTime}</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Taskbar);