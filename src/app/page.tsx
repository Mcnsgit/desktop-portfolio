// src/app/page.tsx
"use client";

import React, { useEffect, useCallback, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import Desktop from "@/components/desktop/Desktop";
import BootAnimation from "@/components/3d/BootAnimation";
import { SoundProvider, useSounds } from "@/hooks/useSounds";
import Hero from "@/components/cv/Hero";
import FontPreloader from "@/utils/FontPreloader";
import Navbar from "@/components/cv/Navbar";
import styles from './page.module.scss';
import CvView from "@/components/cv/CvView";
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button";


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
  const router = useRouter();
  const [isBooting, setIsBooting] = useState(process.env.NODE_ENV !== 'development');
  // const [viewMode, setViewMode] = useState<'cv' | 'desktop'>('cv');
  // const [windows, setWindows] = useState<WindowProps[]>([]);

  // const setActiveWindow = useCallback((id: string) => {
  //   setWindows(prev => prev.map(win => ({ ...win, isActive: win.id === id })));
  // }, []);

  // const updateWindowState = useCallback((id: string, newProps: Partial<WindowProps>) => {
  //   setWindows(prev => prev.map(win => (win.id === id ? { ...win, ...newProps } : win)));
  // }, []);

  // const closeWindow = useCallback((id: string) => {
  //   playSound("windowClose");
  //   setWindows(prev => prev.filter(win => win.id !== id));
  // }, [playSound]);

  // const openWindow = useCallback((file: DesktopFile) => {
  //   const existing = windows.find(win => win.id === file.id);
  //   if (existing) {
  //     if (existing.isMinimized) updateWindowState(file.id, { isMinimized: false });
  //     setActiveWindow(file.id);
  //     return;
  //   }

  //   playSound("windowOpen");
  //   const newWindow: WindowProps = {
  //     id: file.id,
  //     title: file.name,
  //     content: generateWindowContent(file), // Using a shared utility
  //     x: Math.random() * (isMobile ? 10 : 200) + (isMobile ? 5 : 50),
  //     y: Math.random() * (isMobile ? 20 : 100) + (isMobile ? 10 : 20),
  //     w: isMobile ? window.innerWidth - 20 : 550,
  //     h: isMobile ? window.innerHeight - 40 : 400,
  //     isMinimized: false,
  //     isMaximized: false,
  //     isActive: true,
  //   };
  //   setWindows(prev => [...prev.map(w => ({ ...w, isActive: false })), newWindow]);
  // }, [windows, isMobile, playSound, setActiveWindow, updateWindowState]);


  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
    playSound("startup");
  }, [playSound]);

  const handleClick = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      console.log("Computer clicked, navigating to desktop...");
      setTimeout(() => {
        router.push("/desktop");
      }, 100);
    },
    [router]
  );


  if (isBooting) {
    return (
      <div className="boot-animation-container">
        <p>click to enter</p>
        <BootAnimation onComplete={handleBootComplete} skipAnimation={isMobile} />
      </div>
    )
  }

  return (

    <>  
    <FontPreloader />
    
    <Navbar />
    <Hero onComputerClick={handleClick} />
    <div className={styles.enterDesktopWrapper}>
      <Button onClick={handleClick}>Enter Desktop</Button>
    </div>
    {/*  <div className="desktop-container"
    onClick={handleEnterDesktop}
    title="Click to enter desktop"
    >
    Click computer to enter desktop
    </div> */}
    <CvView />
      </>

  );
};

export default function HomePage() {
  return (
    <SoundProvider>
      <HomePageContent />
    </SoundProvider>
  );
}