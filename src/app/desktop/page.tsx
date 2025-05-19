"use client";
// app/desktop/age.tsx - without 3d model
import React, { useEffect, useState} from "react";
import { DesktopProvider } from "@/context/DesktopContext";
import Desktop from "@/components/desktop/Desktop";
import MobileView from "@/components/mobile/MobileView";
import { portfolioProjects as projectsData } from "@/data/portfolioData"; // Ensure this imports an array of projects
import Link from "next/link";
import { useDesktop } from "@/context/DesktopContext"; // Importing context at the top
import LoadingScreen from "@/components/3d/LoadingScreen";
import { FileSystemProvider } from "@/context/FileSystemContext";
import { ProjectTag } from "@/types";
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
    
    <DesktopProvider>
      <FileSystemProvider>
      <DesktopInitializer />
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
    </DesktopProvider>
  );
}

// Component to initialize projects
const DesktopInitializer = () => {
  const { dispatch } = useDesktop(); // Using a custom hook for better readability
  useEffect(() => {
    console.log("Initializing projects with data:", projectsData);
    if (projectsData && projectsData.length > 0) {
      dispatch({
        type: "INIT_PROJECTS",
        payload: { projects: projectsData },
      });
    } else {
      console.error("No projects data available or invalid format");
      // Provide fallback project
      dispatch({
        type: "INIT_PROJECTS",
        payload: {
          projects: [
            {
              id: "about",
              title: "About Me",
              icon: "/assets/icons/win98/w98_directory_program_group.ico",
              description: "About the developer",
              tags: ["html" as unknown as ProjectTag],
              technologies: ["html", "css", "javascript"],
              content: "About Me content goes here",
              name: "",
              image: ""
            },
          ],
        },
      });
    }
  }, [dispatch]);
  return null;
};
