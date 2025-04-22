// src/components/windows/WindowManager.tsx
import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { useDesktop } from "../../context/DesktopContext";
import dynamic from "next/dynamic";
import Window from "./Window";
import ErrorBoundary from "../error/ErrorBoundary";
import WindowLoading from "./WindowLoading";
// Utility for dynamic imports with fallback
const dynamicImportWithFallback = (importFunc: () => Promise<any>, fallbackComponent: React.FC) => {
  return dynamic(importFunc, {
    ssr: false,
    loading: () => <WindowLoading message={`Loading...`} />,
  });
};
// Default window content
const DefaultWindowContent = ({ type }: { type: string }) => (
  <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
    <h2>Window Content Unavailable</h2>
    <p>The {type} window type is not available in this version.</p>
    <p>This is a placeholder component.</p>
  </div>
);
// Define simple default components for each window type
const SimpleFolderWindow = () => (
  <div className="simple-window-content">
    <h2>Folder Contents</h2>
    <p>This is a basic folder view.</p>
    <ul>
      <li>Example File 1.txt</li>
      <li>Example File 2.docx</li>
      <li>Example Folder</li>
    </ul>
  </div>
);
// Dynamic imports with fallbacks
const AboutWindow = dynamicImportWithFallback(() => import("./WindowTypes/AboutWindow"), () => <DefaultWindowContent type="About" />);
const ProjectWindow = dynamicImportWithFallback(() => import("./WindowTypes/ProjectWindow"), () => <DefaultWindowContent type="Project" />);
const FileExplorerWindow = dynamicImportWithFallback(() => import("../fileSystem/FileExplorerWindow"), SimpleFolderWindow);
const TextEditorWindow = dynamicImportWithFallback(() => import("./WindowTypes/TextEditorWindow"), () => <DefaultWindowContent type="Text Editor" />);
const ImageViewerWindow = dynamicImportWithFallback(() => import("./WindowTypes/ImageViewerWindow"), () => <DefaultWindowContent type="Image Viewer" />);
const WeatherApp = dynamicImportWithFallback(() => import("../projects/WeatherApp/WeatherApp"), () => <DefaultWindowContent type="Weather App" />);
const FolderWindow = dynamicImportWithFallback(() => import("../fileSystem/FolderWindow"), SimpleFolderWindow);
const ContactWindow = dynamicImportWithFallback(() => import("./WindowTypes/ContactWindow"), () => <DefaultWindowContent type="Contact" />);
const SettingsWindow = dynamicImportWithFallback(() => import("./WindowTypes/SettingsWindow"), () => <DefaultWindowContent type="Settings" />);
// WindowManager component
const WindowManager: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastWindowPosition = useRef({ x: 50, y: 50 });
  useEffect(() => {
    // Update last window position logic...
  }, [state.activeWindowId, state.windows]);
  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      state.windows.forEach(window => {
        let updated = false;
        let newPosition = { ...window.position };
        // Check if window is too far right
        if (window.position.x + 100 > viewportWidth) {
          newPosition.x = Math.max(0, viewportWidth - 100);
          updated = true;
        }
        // Check if window is too far down
        if (window.position.y + 100 > viewportHeight) {
          newPosition.y = Math.max(0, viewportHeight - 100);
          updated = true;
        }
        if (updated) {
          dispatch({
            type: "UPDATE_WINDOW_POSITION",
            payload: { id: window.id, position: newPosition }
          });
        }
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch, state.windows]);
  const visibleWindows = useMemo(() => state.windows.filter(window => !window.minimized), [state.windows]);
  const renderWindowContent = useCallback((window: any) => {
    const { type, id, content } = window;
    switch (type) {
      case "about":
        return <AboutWindow />;
      case "contact":
        return <ContactWindow />;
      case "settings":
        return <SettingsWindow />;
      case "texteditor":
      case id.startsWith("texteditor-"):
        return <TextEditorWindow filePath={content?.filePath} />;
      case "imageviewer":
      case id.startsWith("imageviewer-"):
        return <ImageViewerWindow filePath={content?.filePath} />;
      case "fileexplorer":
      case id.startsWith("fileexplorer-"):
        return <FileExplorerWindow initialPath={content?.initialPath || "/home/guest"} />;
      case "weatherapp":
      case id.startsWith("weatherapp-"):
        return <WeatherApp />;
      case "folder":
      case id.startsWith("folder-"):
        return <FolderWindow folderId={content?.folderId || id.split('-')[1]} />;
      case "project":
      case id.startsWith("project-"):
        const projectId = content?.projectId || id.split('-')[1];
        const project = state.projects.find(p => p.id === projectId);
        return project ? <ProjectWindow project={project} /> : <div className="error-container">Project not found: {projectId}</div>;
      default:
        return <DefaultWindowContent type={type} />;
    }
  }, [state.projects]);
  return (
    <div ref={containerRef} className="window-manager-container">
      {visibleWindows.map(window => (
        <ErrorBoundary key={window.id} fallback={<DefaultWindowContent type="Error" />}>
          <Window id={window.id} title={window.title} initialPosition={window.position} initialSize={window.size}>
            {renderWindowContent(window)}
          </Window>
        </ErrorBoundary>
      ))}
    </div>
  );
};
export default WindowManager;