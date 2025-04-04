// components/windows/WindowManager.tsx
import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { useDesktop } from "../../context/DesktopContext";
import Window from "./Window";
import { WINDOW_POSITIONS, TIMING } from "@/utils/constants/windowConstants";
import { Project } from "../../types";
import {
  initializeWindowManager,
  destroyWindowManager,
  updateWindowManager,
  bringWindowToFront,
} from "@/utils/windowManagerUtil";
import dynamic from "next/dynamic";
import { useSounds } from "@/hooks/useSounds";
import ErrorBoundary from "../error/ErrorBoundary";
import { useWindowMonitor } from "@/hooks/useWindowMonitor";

// Dynamic imports for window content components
const AboutWindow = dynamic(() => import("./WindowTypes/AboutWindow"), {
  ssr: false,
  loading: () => <div className="loading-container">Loading about information...</div>
});

const ProjectWindow = dynamic(() => import("./WindowTypes/ProjectWindow"), {
  ssr: false,
  loading: () => <div className="loading-container">Loading project...</div>
});

const FileExplorerWindow = dynamic(() => import("../fileSystem/FileExplorerWindow"), {
  ssr: false,
  loading: () => <div className="loading-container">Loading file explorer...</div>
});

const TextEditorWindow = dynamic(() => import("./WindowTypes/TextEditorWindow"), {
  ssr: false,
  loading: () => <div className="loading-container">Loading text editor...</div>
});

const ImageViewerWindow = dynamic(() => import("./WindowTypes/ImageViewerWindow"), {
  ssr: false,
  loading: () => <div className="loading-container">Loading image viewer...</div>
});

const WeatherApp = dynamic(() => import("../projects/WeatherApp/WeatherApp"), {
  ssr: false,
  loading: () => <div className="loading-container">Loading weather app...</div>
});

const FolderWindow = dynamic(() => import("../fileSystem/FolderWindow"), {
  ssr: false,
  loading: () => <div className="loading-container">Loading folder...</div>
});

const MobileSkillsComponent = dynamic(() => import("../mobile/MobileSkillsComponent"), {
  ssr: false,
  loading: () => <div className="loading-container">Loading skills...</div>
});

const MobileContactComponent = dynamic(() => import("../mobile/MobileContactComponent"), {
  ssr: false,
  loading: () => <div className="loading-container">Loading contact information...</div>
});

// Type guard for checking content types
const isObject = (value: any): value is Record<string, any> =>
  typeof value === "object" && value !== null && !React.isValidElement(value);

/**
 * WindowManager - Manages and renders all windows in the desktop environment
 */
const WindowManager: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const { playSound } = useSounds();
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize window monitor to keep windows visible
  useWindowMonitor();

  // Get non-minimized windows for rendering
  const visibleWindows = useMemo(() =>
    state.windows.filter(window => !window.minimized),
    [state.windows]
  );

  // Handle window position updates from Swapy
  const handleWindowPositionUpdate = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail && customEvent.detail.id) {
      dispatch({
        type: "UPDATE_WINDOW_POSITION",
        payload: {
          id: customEvent.detail.id,
          position: customEvent.detail.position,
        },
      });
    }
  }, [dispatch]);

  // Initialize SWAPY window manager
  useEffect(() => {
    if (containerRef.current && visibleWindows.length > 0) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log("WindowManager: Swapy initialization started");
        }

        const swapyInstance = initializeWindowManager(containerRef.current);

        if (process.env.NODE_ENV === 'development') {
          console.log("WindowManager: Swapy initialized successfully");
        }

        // Listen for window position updates from Swapy
        document.addEventListener('window-position-update', handleWindowPositionUpdate);

        return () => {
          destroyWindowManager();
          document.removeEventListener('window-position-update', handleWindowPositionUpdate);
        };
      } catch (error) {
        console.error("Error initializing window manager:", error);
      }
    }
  }, [visibleWindows.length, handleWindowPositionUpdate]);

  // Update SWAPY when windows change
  useEffect(() => {
    if (visibleWindows.length > 0) {
      const timer = setTimeout(() => {
        try {
          updateWindowManager();
          if (process.env.NODE_ENV === 'development') {
            console.log("WindowManager: Swapy updated after window changes");
          }
        } catch (error) {
          console.error("Error updating window manager:", error);
        }
      }, TIMING.POSITION_UPDATE_DEBOUNCE);

      return () => clearTimeout(timer);
    }
  }, [visibleWindows]);

  // Bring active window to front
  useEffect(() => {
    if (state.activeWindowId) {
      bringWindowToFront(state.activeWindowId);
    }
  }, [state.activeWindowId]);

  // Render appropriate content based on window type
  const renderWindowContent = useCallback((window: any) => {
    // About Me window
    if (window.id === "about" || window.type === "about") {
      return <AboutWindow />;
    }

    // Skills window
    if (window.id === "skills" || window.type === "skills") {
      return <MobileSkillsComponent />;
    }

    // Contact window
    if (window.id === "contact" || window.type === "contact") {
      return <MobileContactComponent />;
    }

    // Text Editor window
    if (window.type === "texteditor" || window.id.startsWith("texteditor-")) {
      const filePath = isObject(window.content) && "filePath" in window.content
        ? (window.content.filePath as string)
        : undefined;

      return <TextEditorWindow filePath={filePath} />;
    }

    // Image Viewer window
    if (window.type === "imageviewer" || window.id.startsWith("imageviewer-")) {
      const filePath = isObject(window.content) && "filePath" in window.content
        ? (window.content.filePath as string)
        : undefined;

      return <ImageViewerWindow filePath={filePath} />;
    }

    // File Explorer window
    if (window.type === "fileexplorer" || window.id.startsWith("fileexplorer-")) {
      const initialPath = isObject(window.content) && "initialPath" in window.content
        ? (window.content.initialPath as string)
        : "/home/guest";

      return <FileExplorerWindow initialPath={initialPath} />;
    }

    // Weather App window
    if (window.type === "weatherapp" || window.id.startsWith("weatherapp-")) {
      return <WeatherApp />;
    }

    // Folder windows
    if (window.type === "folder" || window.id.startsWith("folder-")) {
      let folderId: string;

      if (typeof window.content === "string") {
        folderId = window.content;
      } else if (isObject(window.content) && "folderId" in window.content) {
        folderId = window.content.folderId as string;
      } else {
        folderId = window.id.replace("folder-", "");
      }

      return <FolderWindow folderId={folderId} />;
    }

    // Project windows
    if (window.type === "project" || window.id.startsWith("project-")) {
      // Find the project by ID if content is a string
      if (typeof window.content === "string") {
        const projectId = window.id.replace("project-", "");
        const project = state.projects.find((p) => p.id === projectId);

        if (project) {
          return <ProjectWindow project={project} />;
        } else {
          return (
            <div className="error-container">
              Project not found: {projectId}
            </div>
          );
        }
      }

      // If content is already a Project object
      return <ProjectWindow project={window.content as unknown as Project} />;
    }

    // Default case - unknown window type
    return (
      <div className="empty-window-content">
        Content not available for window type: {window.type || "unknown"}
      </div>
    );
  }, [state.projects]);

  if (state.windows.length === 0) {
    return (
      <div
        ref={containerRef}
        className="window-container"
        style={{ position: "relative", width: "100%", height: "100%" }}
        data-testid="empty-window-container"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="window-container"
      style={{ position: "relative", width: "100%", height: "100%" }}
      data-testid="window-container"
    >
      {/* Only render non-minimized windows */}
      {visibleWindows.map((window) => (
        <ErrorBoundary
          key={window.id}
          fallback={
            <div className="window-error-fallback">
              Error rendering window: {window.title}
            </div>
          }
        >
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            initialPosition={window.position}
            initialSize={window.size}
          >
            {renderWindowContent(window)}
          </Window>
        </ErrorBoundary>
      ))}
    </div>
  );
};

export default React.memo(WindowManager);