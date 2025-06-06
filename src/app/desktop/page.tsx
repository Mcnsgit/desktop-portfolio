"use client";
// app/desktop/page.tsx - Model-driven desktop without Context
import React, { useEffect, useState} from "react";
import Desktop from "@/components/desktop/Desktop";
import MobileView from "@/components/mobile/MobileView";
import Link from "next/link";
import LoadingScreen from "@/components/3d/LoadingScreen";
import { FileSystemProvider } from "@/context/FileSystemContext";
import styles from './desktop.module.scss'; // Import the SCSS module

export default function DesktopPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);
  // Check for mobile devices
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  if (!isClientReady) {
    return <LoadingScreen show={true} message="Initializing..." />;
  }

  return (
    <FileSystemProvider>
      <div className={styles.desktopPageContainer}>
        {/* Back to 3D View Button */}
        <Link href="/" passHref>
          <button
            className={styles.backButton}
            aria-label="Back to 3D View"
            >
            Back to 3D View
          </button>
        </Link>
        <div className={styles.contentWrapper}>
          {isMobile ? <MobileView /> : <Desktop />}
        </div>
      </div>
    </FileSystemProvider>
  );
}

// Project initialization now happens in BrowserFileSystem during initialization
