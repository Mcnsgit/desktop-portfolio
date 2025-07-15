// src/app/page.tsx
"use client";

import React, { useEffect, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Desktop from "@/components/desktop/Desktop";
import BootAnimation from "@/components/3d/BootAnimation";
import { SoundProvider, useSounds } from "@/hooks/useSounds";
import  Hero from "@/components/cv/Hero";
import FontPreloader from "@/utils/FontPreloader";
import Navbar from "@/components/cv/Navbar";
// import styles from './page.module.scss';
import MobileView from "@/components/mobile/MobileView";
import { WindowProps } from "@/types/window";
import { DesktopFile } from "@/types/fs";
import { desktopFiles } from "@/config/data";
import generateWindowContent from "@/utils/windowContentGenerator"; // We'll create this utility
import CvView from "@/components/cv/CvView";

const useResponsiveView = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  return { isMobile };
};


const HomePageContent = () => {
  const { playSound } = useSounds();
  const { isMobile } = useResponsiveView();

  const [isBooting, setIsBooting] = useState(process.env.NODE_ENV !== 'development');
  const [viewMode, setViewMode] = useState<'cv' | 'desktop'>('cv');
  const [windows, setWindows] = useState<WindowProps[]>([]);

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
      content: generateWindowContent(file), // Using a shared utility
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
  // --- END OF STATE MANAGEMENT ---

  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
    playSound("startup");
  }, [playSound]);

  const handleEnterDesktop = () => {
    console.log("handleEnterDesktop triggered in page.tsx");
    playSound("click");
    setViewMode('desktop');
  };

  if (isBooting) {
    return(
      <div className="boot-animation-container">
        <p>click to enter</p>
        <BootAnimation onComplete={handleBootComplete} skipAnimation={isMobile} />
      </div>
  )}

  return (
    <AnimatePresence mode="wait">
      <FontPreloader />
      {viewMode === 'cv' ? (
        <motion.div key="cv-view" exit={{ opacity: 0, transition: { duration: 0.5 } }}>
          <Navbar />
          <Hero onComputerClick={handleEnterDesktop} />
          <CvView />
        </motion.div>
      ) : (
        <motion.div key="desktop-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {isMobile ? (
            <MobileView
              windows={windows}
              desktopFiles={desktopFiles}
              onOpenWindow={openWindow}
              onCloseWindow={closeWindow}
            />
          ) : (
            <Desktop


            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function HomePage() {
  return (
    <SoundProvider>
      <HomePageContent />
    </SoundProvider>
  );
}