"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from './page.module.scss';
// CV Components
import Navbar from "@/components/cv/Navbar";
import Hero from "@/components/cv/Hero";
import About from "@/components/cv/About";
import Tech from "@/components/cv/Tech";
import Works from "@/components/cv/Works";
import Experience from "@/components/cv/Experience";
import Contact from "@/components/cv/Contact";
// 3D & Utils
import BootAnimation from "@/components/3d/BootAnimation";
import LoadingScreen from "@/components/3d/LoadingScreen";
import { useSounds } from "@/hooks/useSounds";
import FontPreloader from "@/utils/FontPreloader";
import { AnimatePresence, motion } from 'framer-motion';
// Desktop Components
import Desktop from "@/components/desktop/Desktop";
import { useFileSystem } from "@/context/FileSystemContext";


export default function HomePage() {
  const [isBooting, setIsBooting] = useState(process.env.NODE_ENV !== 'development'); // Default to true unless dev
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { playSound } = useSounds();
  const [viewMode, setViewMode] = useState<'cv' | 'desktop'>('cv');
  const { fsInstance, isReady } = useFileSystem();

  // Check for mobile devices and set event listeners for resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  if (!isReady || !fsInstance) {
    return <LoadingScreen show={true} message="Initializing File System..." />;
  }


  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
    playSound("startup");
  }, [playSound]);

  useEffect(() => {
    if (isClient && isMobile && !isBooting && isReady && fsInstance) {
      setViewMode('desktop');
    }
  }, [isClient, isMobile, isBooting, isReady, fsInstance]);

  // Render Loading or Boot Animation
  if (!isClient) return <div className="bg-primary h-screen w-screen flex items-center justify-center text-white">Loading...</div>;
  if (isMobile && !isBooting) return <LoadingScreen show={true} message="Loading Mobile Experience..." />;
  if (isBooting) return (<> <FontPreloader /> <BootAnimation onComplete={handleBootComplete} skipAnimation={isMobile} /> </>);


  const handleEnterDesktop = () => {
    playSound("startup");
    setViewMode('desktop');
  }

  return (
    <AnimatePresence mode="wait">
      {viewMode === 'cv' ? (
        <motion.div
          key="cv-view"
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <div className={`${styles.homePageContainer}`}>
            <div className={`${styles.contentLayer} relative z-10`}>
              <FontPreloader />
              <Navbar />
              <Hero />
            </div>
            {/* Desktop Entry Button */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontSize: '16px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '10px 20px',
              borderRadius: '5px'
            }}>
              Click on the computer to enter desktop mode
            </div>
            <div id="about">
              <About />
            </div>
            <div id="skills">
              <Tech />
            </div>
            <div id="experience">
              <Experience />
            </div>
            <div id="projects">
              <Works />
            </div>
            <div id="contact">
              <Contact />
            </div>
            <div
              className={`${styles.desktopEntryButton} fixed bottom-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg backdrop-blur-sm border border-white/20 bg-black/60 text-white text-sm cursor-pointer hover:bg-black/80 transition-colors z-50 animate-pulse`} // Tailwind classes kept, added module style for animation
              onClick={handleEnterDesktop}
              title="Enter Retro Desktop Mode"
            // style={{ animation: "pulse 2s infinite" }} // Removed inline style
            >
              Click computer to enter desktop
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="desktop-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.3 } }}
        >
          <Desktop />
        </motion.div>
      )}

    </AnimatePresence>
  );
}