"use client";
// app/desktop/age.tsx - without 3d model
import React, { useEffect, useState, useCallback, use } from "react";
import { DesktopProvider } from "@/context/DesktopContext";
import Desktop from "@/components/desktop/Desktop";
import MobileView from "@/components/mobile/MobileView";
import projectsData from "@/data/project"; // Ensure this imports an array of projects
import Link from "next/link";
import { useDesktop } from "@/context/DesktopContext"; // Importing context at the top
import LoadingScreen from "@/components/3d/LoadingScreen";
import { FileSystemProvider } from "@/context/FileSystemContext";
import { ProjectTag } from "@/types";

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
      <div className="desktop-container">
        {/* Back to 3D View Button */}
        <Link href="/" passHref>
          <button
            className="back-button"
            aria-label="Back to 3D View"
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              zIndex: 1000,
              padding: "5px 10px",
              backgroundColor: "#c0c0c0",
              border: "2px solid",
              borderColor: "#dfdfdf #808080 #808080 #dfdfdf",
              fontFamily: "MS Sans Serif, sans-serif",
              fontSize: "12px",
              cursor: "pointer",
            }}
            >
            Back to 3D View
          </button>
        </Link>
        {isMobile ? <MobileView /> : <Desktop />}
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
