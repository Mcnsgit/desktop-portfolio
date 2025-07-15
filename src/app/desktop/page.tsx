"use client";
import React, { useEffect, useState, useCallback } from "react";
import Desktop from "@/components/desktop/Desktop";
import MobileView from "@/components/mobile/MobileView";
import Link from "next/link";
import { isMobile as isMobileDetect } from "react-device-detect";
import styles from './desktop.module.scss'; 
import LoadingScreen from "@/components/3d/LoadingScreen";
import { WindowProps } from "@/types/window";
import { DesktopFile } from "@/types/fs";
import { desktopFiles } from "@/config/data";
import generateWindowContent from "@/utils/windowContentGenerator";
import { useSounds } from "@/hooks/useSounds";

const DesktopPageContent = () => {
  const [isClient, setIsClient] = useState(false);
  const { playSound } = useSounds();
  const [windows, setWindows] = useState<WindowProps[]>([]);
  const isMobile = isClient && isMobileDetect;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const setActiveWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(win => ({ ...win, isActive: win.id === id })));
  }, []);

  const updateWindowState = useCallback((id: string, newProps: Partial<WindowProps>) => {
    setWindows(prev => prev.map(win => (win.id === id ? { ...win, ...newProps } : win)));
  }, []);

  const closeWindow = useCallback((id: string) => {
    playSound("windowClose");
    setWindows(prev => prev.filter(win => win.id !== id));
  }, [playSound]);

  const openWindow = useCallback((file: DesktopFile) => {
    const existing = windows.find(win => win.id === file.id);
    if (existing) {
      if (existing.isMinimized) updateWindowState(file.id, { isMinimized: false });
      setActiveWindow(file.id);
      return;
    }

    playSound("windowOpen");
    const newWindow: WindowProps = {
      id: file.id,
      title: file.name,
      content: generateWindowContent(file),
      x: Math.random() * (isMobile ? 10 : 200) + (isMobile ? 5 : 50),
      y: Math.random() * (isMobile ? 20 : 100) + (isMobile ? 10 : 20),
      w: isMobile ? window.innerWidth - 20 : 550,
      h: isMobile ? window.innerHeight - 40 : 400,
      isMinimized: false,
      isMaximized: false,
      isActive: true,
    };
    setWindows(prev => [...prev.map(w => ({ ...w, isActive: false })), newWindow]);
  }, [windows, isMobile, playSound, setActiveWindow, updateWindowState]);

  if (!isClient) {
    return <LoadingScreen show={true} />; 
  }

  return (
    <div className={styles.desktopPageContainer}>
      <Link href="/" passHref>
        <button
          className={styles.backButton}
          aria-label="Back to 3D View"
          >
          Back to 3D View
        </button>
      </Link>
      <div className={styles.contentWrapper}>
        {isMobile ? <MobileView 
            windows={windows}
            desktopFiles={desktopFiles}
            onOpenWindow={openWindow}
            onCloseWindow={closeWindow}
        /> : <Desktop />}
      </div>
    </div>
  );
};

export default function DesktopPage() {
  return (
      <DesktopPageContent />
  );
}
