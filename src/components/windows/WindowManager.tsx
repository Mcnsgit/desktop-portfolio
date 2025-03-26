// components/windows/WindowManager.tsx
import React, { useEffect, useRef, useMemo } from "react";
import { useDesktop } from "../../context/DesktopContext";
import Window from "./Window";
import AboutWindow from "./WindowTypes/AboutWindow";
import ProjectWindow from "./WindowTypes/ProjectWindow";
import FileExplorerWindow from "./WindowTypes/FileExplorerWindow";
import TextEditorWindow from "./WindowTypes/TextEditorWindow";
import ImageViewerWindow from "./WindowTypes/ImageViewerWindow";
import WeatherApp from "../projects/WeatherApp/WeatherApp";
import FolderWindow from "./WindowTypes/FolderWindow";
import { Project } from "../../types";
import {
  initializeWindowManager,
  destroyWindowManager,
  updateWindowManager,
} from "@/utils/windowManagerUtil";
import dynamic from "next/dynamic";
// Type guard functions for checking content types
const isObject = (value: any): value is Record<string, any> =>
  typeof value === "object" && value !== null && !React.isValidElement(value);

const WindowManager: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const containerRef = useRef<HTMLDivElement>(null);
  const windowArray = useMemo(() => state.windows, [state.windows]);
  // Initialize SWAPY window manager
  useEffect(() => {
    if (containerRef.current && windowArray.length > 0) {
      try {
        console.log("WindowManager: Swapy initialization started");
        const swapyInstance = initializeWindowManager(containerRef.current);
        console.log("WindowManager: Swapy initialized successfully");

        return () => {
          destroyWindowManager();
        };
      } catch (error) {
        console.error("Error initializing window manager:", error);
      }
    } else if (windowArray.length === 0) {
      console.log("No windows to render");
    }
  }, [windowArray]); // Directly use windowArray as a dependency

  // Update SWAPY when windows change
  useEffect(() => {
    // Only attempt to update if there are windows
    if (state.windows.length > 0) {
      // Slight delay to ensure DOM is updated
      const timer = setTimeout(() => {
        try {
          updateWindowManager();
          console.log("WindowManager: Swapy updated after window changes");
        } catch (error) {
          console.error("Error updating window manager:", error);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [state.windows]);

  // Debug logging
  useEffect(() => {
    console.log("WindowManager rendering with windows:", state.windows);
  }, [state.windows]);

  if (state.windows.length === 0) {
    console.log("No windows to render");
    return (
      <div
        ref={containerRef}
        className="window-container"
        style={{ position: "relative", width: "100%", height: "100%" }}
      ></div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="window-container"
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      {state.windows.map((window) => {
        // About Me window
        if (window.id === "about" || window.type === "about") {
          console.log("Rendering About window");
          return (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              initialPosition={window.position}
              initialSize={window.size}
            >
              <AboutWindow />
            </Window>
          );
        }
        // Add special case for Skills window 
        if (window.id === "skills" || window.type === "skills") {
          console.log("Rendering Skills window");

          // Import the Skills component
          const MobileSkillsComponent = dynamic(() => import('../mobile/MobileSkillsComponent'), {
            ssr: false,
            loading: () => <div>Loading skills...</div>
          });

          return (
            <Window
              key={window.id}
              id={window.id}
              title={window.title || "Technical Skills"}
              initialPosition={window.position}
              initialSize={window.size || { width: 600, height: 450 }}
            >
              <MobileSkillsComponent />
            </Window>
          );
        }

        // Add special case for Contact window
        if (window.id === "contact" || window.type === "contact") {
          console.log("Rendering Contact window");

          // Import the Contact component
          const MobileContactComponent = dynamic(() => import('../mobile/MobileContactComponent'), {
            ssr: false,
            loading: () => <div>Loading contact information...</div>
          });

          return (
            <Window
              key={window.id}
              id={window.id}
              title={window.title || "Contact Information"}
              initialPosition={window.position}
              initialSize={window.size || { width: 550, height: 450 }}
            >
              <MobileContactComponent />
            </Window>
          );
        }
        // Text Editor window
        if (
          window.type === "texteditor" ||
          window.id.startsWith("texteditor-")
        ) {
          console.log(`Rendering Text Editor window: ${window.id}`);
          const filePath =
            isObject(window.content) && "filePath" in window.content
              ? (window.content.filePath as string)
              : undefined;

          return (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              initialPosition={window.position}
              initialSize={window.size || { width: 600, height: 400 }}
            >
              <TextEditorWindow filePath={filePath} />
            </Window>
          );
        }

        // Image Viewer window
        if (
          window.type === "imageviewer" ||
          window.id.startsWith("imageviewer-")
        ) {
          console.log(`Rendering Image Viewer window: ${window.id}`);
          const filePath =
            isObject(window.content) && "filePath" in window.content
              ? (window.content.filePath as string)
              : undefined;

          return (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              initialPosition={window.position}
              initialSize={window.size || { width: 500, height: 400 }}
            >
              <ImageViewerWindow filePath={filePath} />
            </Window>
          );
        }

        // File Explorer window
        if (
          window.type === "fileexplorer" ||
          window.id.startsWith("fileexplorer-")
        ) {
          console.log(`Rendering File Explorer window: ${window.id}`);
          const initialPath =
            isObject(window.content) && "initialPath" in window.content
              ? (window.content.initialPath as string)
              : "/home/guest";

          return (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              initialPosition={window.position}
              initialSize={window.size || { width: 600, height: 450 }}
            >
              <FileExplorerWindow initialPath={initialPath} />
            </Window>
          );
        }

        // Weather App window
        if (
          window.type === "weatherapp" ||
          window.id.startsWith("weatherapp-")
        ) {
          console.log(`Rendering Weather App window: ${window.id}`);
          return (
            <Window
              key={window.id}
              id={window.id}
              title={window.title || "Weather App"}
              initialPosition={window.position || { x: 150, y: 150 }}
              initialSize={window.size || { width: 500, height: 460 }}
            >
              <WeatherApp />
            </Window>
          );
        }

        // Folder windows
        if (window.type === "folder" || window.id.startsWith("folder-")) {
          // Extract folder ID using proper type checking
          let folderId: string;

          if (typeof window.content === "string") {
            folderId = window.content;
          } else if (isObject(window.content) && "folderId" in window.content) {
            folderId = window.content.folderId as string;
          } else {
            folderId = window.id.replace("folder-", "");
          }

          console.log(`Rendering Folder window for folder ID: ${folderId}`);

          return (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              initialPosition={window.position}
              initialSize={window.size || { width: 500, height: 400 }}
            >
              <FolderWindow folderId={folderId} />
            </Window>
          );
        }

        // Project windows
        if (window.type === "project" || window.id.startsWith("project-")) {
          console.log(`Rendering Project window: ${window.id}`);

          // Find the project by ID if content is a string
          if (typeof window.content === "string") {
            const projectId = window.id.replace("project-", "");
            console.log(`Looking for project with ID: ${projectId}`);

            const project = state.projects.find((p) => p.id === projectId);

            if (project) {
              console.log(`Found project:`, project);
              return (
                <Window
                  key={window.id}
                  id={window.id}
                  title={window.title}
                  initialPosition={window.position}
                  initialSize={window.size}
                >
                  <ProjectWindow project={project} />
                </Window>
              );
            } else {
              console.error(`Project not found for ID: ${projectId}`);
            }
          }

          // If content is already a Project object
          console.log(`Using window content directly as project`);
          return (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              initialPosition={window.position}
              initialSize={window.size}
            >
              <ProjectWindow project={window.content as unknown as Project} />
            </Window>
          );
        }

        // Default empty window for unsupported types
        console.log(
          `Rendering default window for unsupported type: ${window.type}`
        );
        return (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            initialPosition={window.position}
            initialSize={window.size}
          >
            <div>Content not available</div>
          </Window>
        );
      })}
    </div>
  );
};

export default WindowManager;
