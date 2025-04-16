// components/windows/WindowManager.tsx
import React, { useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import { useDesktop } from "../../context/DesktopContext";
import Window from "./Window"; // Use the refactored Window
// Removed TIMING import if only used for Swapy debounce
import { Project } from "../../types";
// Removed Swapy utils imports
import dynamic from "next/dynamic";
import ErrorBoundary from "../error/ErrorBoundary";
import { useWindowMonitor } from "@/hooks/useWindowMonitor";
// Removed fixStyles import if WindowFix.module.scss is removed or merged
import WindowLoading from "./WindowLoading";

// Dynamic imports for window content components
const AboutWindow = dynamic(() => import("./WindowTypes/AboutWindow"), {
  ssr: false,
  loading: () => <WindowLoading message="Loading about information..." />
});

const ProjectWindow = dynamic(() => import("./WindowTypes/ProjectWindow"), {
  ssr: false,
  loading: () => <WindowLoading message="Loading project..." />
});

const FileExplorerWindow = dynamic(() => import("../fileSystem/FileExplorerWindow"), {
  ssr: false,
  loading: () => <WindowLoading message="Loading file explorer..." />
});

const TextEditorWindow = dynamic(() => import("./WindowTypes/TextEditorWindow"), {
  ssr: false,
  loading: () => <WindowLoading message="Loading text editor..." />
});

const ImageViewerWindow = dynamic(() => import("./WindowTypes/ImageViewerWindow"), {
  ssr: false,
  loading: () => <WindowLoading message="Loading image viewer..." />
});

const WeatherApp = dynamic(() => import("../projects/WeatherApp/WeatherApp"), {
  ssr: false,
  loading: () => <WindowLoading message="Loading weather app..." />
});

const FolderWindow = dynamic(() => import("../fileSystem/FolderWindow"), {
  ssr: false,
  loading: () => <WindowLoading message="Loading folder..." />
});

const ContactWindow = dynamic(() => import("./WindowTypes/ContactWindow"), {
  ssr: false,
  loading: () => <WindowLoading message="Loading contact information..." />
});

const EducationWindow = dynamic(() => import("./WindowTypes/EducationWindow"), {
  ssr: false,
  loading: () => <WindowLoading message="Loading education information..." />
});


const MobileSkillsComponent = dynamic(() => import("../mobile/MobileSkillsComponent"), {
  ssr: false,
  loading: () => <div className="loading-container">Loading skills...</div>
});

const MobileContactComponent = dynamic(() => import("../mobile/MobileContactComponent"), {
  ssr: false,
  loading: () => <div className="loading-container">Loading contact information...</div>
});

const isObject = (value: any): value is Record<string, any> =>
  typeof value === "object" && value !== null && !React.isValidElement(value);

const WindowManager: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const containerRef = useRef<HTMLDivElement>(null); // Ref for bounds in Draggable

  useWindowMonitor();

  // Get non-minimized windows for rendering
  const visibleWindows = useMemo(() =>
    state.windows.filter(window => !window.minimized),
    [state.windows]
  );

  // Render appropriate content based on window type
  const renderWindowContent = useCallback((window: any) => {
    // About Me window
    if (window.id === "about" || window.type === "about") {
      return (
        <Suspense fallback={<WindowLoading message="Loading about section..." />}>
          <AboutWindow />
        </Suspense>
      );
    }

    // Contact window
    if (window.id === "contact" || window.type === "contact") {
      return (
        <Suspense fallback={<WindowLoading message="Loading contact section..." />}>
          <ContactWindow />
        </Suspense>
      );
    }

    // Education window
    if (window.id === "education" || window.type === "education") {
      return (
        <Suspense fallback={<WindowLoading message="Loading education section..." />}>
          <EducationWindow />
        </Suspense>
      );
    }

    // Text Editor window
    if (window.type === "texteditor" || window.id.startsWith("texteditor-")) {
      const filePath = isObject(window.content) && "filePath" in window.content
        ? (window.content.filePath as string)
        : undefined;

      return (
        <Suspense fallback={<WindowLoading message="Loading text editor..." />}>
          <TextEditorWindow filePath={filePath} />
        </Suspense>
      );
    }

    // Image Viewer window
    if (window.type === "imageviewer" || window.id.startsWith("imageviewer-")) {
      const filePath = isObject(window.content) && "filePath" in window.content
        ? (window.content.filePath as string)
        : undefined;

      return (
        <Suspense fallback={<WindowLoading message="Loading image viewer..." />}>
          <ImageViewerWindow filePath={filePath} />
        </Suspense>
      );
    }

    // File Explorer window
    if (window.type === "fileexplorer" || window.id.startsWith("fileexplorer-")) {
      const initialPath = isObject(window.content) && "initialPath" in window.content
        ? (window.content.initialPath as string)
        : "/home/guest";

      return (
        <Suspense fallback={<WindowLoading message="Loading file explorer..." />}>
          <FileExplorerWindow initialPath={initialPath} />
        </Suspense>
      );
    }

    // Weather App window
    if (window.type === "weatherapp" || window.id.startsWith("weatherapp-")) {
      return (
        <Suspense fallback={<WindowLoading message="Loading weather app..." />}>
          <WeatherApp />
        </Suspense>
      );
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

      return (
        <Suspense fallback={<WindowLoading message="Loading folder contents..." />}>
          <FolderWindow folderId={folderId} />
        </Suspense>
      );
    }

    // Project windows
    if (window.type === "project" || window.id.startsWith("project-")) {
      // Find the project by ID if content is a string
      if (typeof window.content === "string") {
        const projectId = window.id.replace("project-", "");
        const project = state.projects.find((p) => p.id === projectId);

        if (project) {
          return (
            <Suspense fallback={<WindowLoading message="Loading project..." />}>
              <ProjectWindow project={project} />
            </Suspense>
          );
        } else {
          return (
            <div className="error-container">
              Project not found: {projectId}
            </div>
          );
        }
      }

      // If content is already a Project object
      return (
        <Suspense fallback={<WindowLoading message="Loading project..." />}>
          <ProjectWindow project={window.content as unknown as Project} />
        </Suspense>);
     }
          return (<div>Content not available for window type: {window.type || "unknown"}</div>);

  }, [state.projects]); // Ensure dependencies are correct


    // Pass containerRef to children for bounds
    // The container needs relative positioning
    return (
      <div
        ref={containerRef}
        className="window-manager-container" // Add a class for styling if needed
        style={{ position: "absolute", inset: 0, overflow: 'hidden', pointerEvents: 'none' }} // Make it cover desktop area, allow clicks through
        data-testid="window-manager-container"
      >
        {/* Development debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info">Development Mode Active</div>
        )}

        {/* Render Windows */}
        {visibleWindows.map((window) => (
          <ErrorBoundary
            key={window.id}
            fallback={<div>Error loading window content.</div>}
          >
            {/* Pass resizable prop if needed based on window type/config */}
            <Window
              key={window.id} // Key on Window component itself
              id={window.id}
              title={window.title}
              initialPosition={window.position} // Pass initial props
              initialSize={window.size}
              resizable={window.type !== 'about'} // Example: Make 'about' not resizable
            >
              {renderWindowContent(window)}
            </Window>
          </ErrorBoundary>
        ))}
      </div>
    );
  }


  // Removed React.memo - state changes will cause re-renders anyway
  export default WindowManager;