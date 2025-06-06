// src/components/windows/WindowManager.tsx
import React, { useEffect, useRef, useMemo, useCallback } from "react";
// import { useDesktop } from "../../context/DesktopContext"; // Replaced
import dynamic from "next/dynamic";
import WindowComponent from "./Window"; // Renamed to avoid conflict with model
import ErrorBoundary from "../error/ErrorBoundary";
import WindowLoading from "./WindowLoading";

// --- Import New Model Classes ---
import { Desktop as DesktopModel } from "../../../src/model/Desktop";
import { WindowModel } from "../../../src/model/Window";
import { portfolioProjects } from "../../data/portfolioData";
// import { IDesktopItem } from "../../../src/model/DesktopItem"; // Not directly used

// Prop types for dynamically imported components
import { FileExplorerWindowProps } from "../fileSystem/FileExplorerWindow"; 
import { TextEditorWindowProps } from "./WindowTypes/TextEditorWindow";
// Assuming ProjectWindowProps exists if ProjectWindow is used
// interface ProjectWindowProps { project: any; /* other props */ }


// Utility for dynamic imports with fallback
function dynamicImportWithFallback<P = {}>(importFunc: () => Promise<{ default: React.ComponentType<P> }>, _fallbackComponent?: React.FC<P> | React.ComponentType<P>) {
  return dynamic(importFunc, {
    ssr: false,
    loading: () => <WindowLoading message={`Loading...`} />,
  }) as React.ComponentType<P>;
}

const DefaultWindowContent = ({ type }: { type: string }) => (
  <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
    <h2>Window Content Unavailable</h2>
    <p>The {type} window type is not available in this version.</p>
    <p>This is a placeholder component.</p>
  </div>
);

// Simple fallback for folder-like views if FileExplorer is loading
const SimpleFileExplorerFallback = () => (
    <div className="simple-window-content">
      <h2>Explorer Loading...</h2>
      <p>This is a basic file explorer view.</p>
      <ul>
        <li>File 1.txt</li>
        <li>Folder A</li>
      </ul>
    </div>
  );


// Dynamic imports - these will need to be adapted to receive props from WindowModel.content
const AboutWindow = dynamicImportWithFallback(() => import("./WindowTypes/AboutWindow"), () => <DefaultWindowContent type="About" />);
const EducationWindow = dynamicImportWithFallback(() => import("./WindowTypes/EducationWindow"), () => <DefaultWindowContent type="Education" />);
const ProjectWindow = dynamicImportWithFallback<{ project: any }>(
  () => import("./WindowTypes/ProjectWindow"),
  () => <DefaultWindowContent type="Project" />
);
const FileExplorerWindow = dynamicImportWithFallback<FileExplorerWindowProps>(
  () => import("../fileSystem/FileExplorerWindow").then(mod => ({ default: mod.default })),
  SimpleFileExplorerFallback 
);
const TextEditorWindow = dynamicImportWithFallback<TextEditorWindowProps>(
  () => import("./WindowTypes/TextEditorWindow").then(mod => ({ default: mod.default })),
  () => <DefaultWindowContent type="Text Editor" />
);
const ImageViewerWindow = dynamicImportWithFallback<{ filePath?: string }>(
  () => import("./WindowTypes/ImageViewerWindow"),
  () => <DefaultWindowContent type="Image Viewer" />
);
const WeatherApp = dynamicImportWithFallback(
  () => import("../projects/WeatherApp/WeatherApp"),
  () => <DefaultWindowContent type="Weather App" />
);
const ContactWindow = dynamicImportWithFallback(() => import("./WindowTypes/ContactWindow"), () => <DefaultWindowContent type="Contact" />);
const SettingsWindow = dynamicImportWithFallback(() => import("./WindowTypes/SettingsWindow"), () => <DefaultWindowContent type="Settings" />);
const TodoList = dynamicImportWithFallback(
  () => import("../projects/TodoList/TodoList"),
  () => <DefaultWindowContent type="Todo List" />
);

interface WindowManagerProps {
  windows: WindowModel[]; // Use WindowModel from our new model
  desktopModel: DesktopModel;
  forceUpdate: () => void;
}

const WindowManager: React.FC<WindowManagerProps> = ({ windows, desktopModel, forceUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize handling might be better placed in Desktop.tsx or a general App layout component
  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      windows.forEach(win => {
        if (!win.isOpen || win.isMaximized) return; 
        let updated = false;
        let newPosition = { ...win.position };
        if (win.position.x + 100 > viewportWidth) { 
          newPosition.x = Math.max(0, viewportWidth - (win.size.width / 2)); 
          updated = true;
        }
        if (win.position.y + 100 > viewportHeight) {
          newPosition.y = Math.max(0, viewportHeight - (win.size.height / 2));
          updated = true;
        }
        if (updated) {
          win.position = newPosition; 
          forceUpdate(); 
        }
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windows, forceUpdate]);

  const visibleWindows = useMemo(() =>
    windows.filter(window => window.isOpen && !window.isMinimized).sort((a, b) => {
        if (a.isFocused) return 1;
        if (b.isFocused) return -1;
        return 0; 
    }),
    [windows]
  );

  const renderWindowContent = useCallback((window: WindowModel) => {
    const { content, id, sourceItem } = window; 
    const contentType = typeof content === 'object' && content !== null && 'type' in content ? content.type : 'unknown';
    
    let effectiveType = contentType;
    // Guess type if not explicitly set in content.type (legacy or simple cases)
    if (contentType === 'unknown' || !contentType) {
        if (window.title.toLowerCase().includes('about')) effectiveType = 'about';
        else if (window.title.toLowerCase().includes('explorer') || sourceItem?.type === 'Folder') effectiveType = 'fileexplorer'; // Folder should open FileExplorer
        else if (sourceItem?.type === 'File' && (sourceItem.name.endsWith('.txt') || sourceItem.name.endsWith('.md'))) effectiveType = 'texteditor'; // Example guess for text files
        else if (sourceItem?.type === 'File' && (sourceItem.name.match(/\.(jpeg|jpg|gif|png)$/i))) effectiveType = 'imageviewer'; // Example for images
    }
    
    const dynamicIdPrefix = id.split('-')[0]; // Fallback for older ID-based typing

    switch (effectiveType) { 
      case "about":
        return <AboutWindow />;
      case "contact":
        return <ContactWindow />;
      case "education":
        return <EducationWindow />;
      case "settings":
        return <SettingsWindow />;
      case "texteditor":
      case dynamicIdPrefix === "texteditor":
        return <TextEditorWindow 
                    desktopModel={desktopModel} 
                    windowId={id} 
                    filePath={content?.filePath || sourceItem?.path || ""} 
                />;
      case "imageviewer":
      case dynamicIdPrefix === "imageviewer":
        return <ImageViewerWindow filePath={content?.filePath || sourceItem?.path} />;
      
      case "fileexplorer": // Handles 'folder' type implicitly now
      case "folder": // Explicitly handle 'folder' to ensure it maps to FileExplorer
      case dynamicIdPrefix === "fileexplorer":
      case dynamicIdPrefix === "folder":
        const initialPath = content?.initialPath || sourceItem?.path || "/home/guest/Desktop"; // Default to Desktop
        const folderIdToUse = content?.folderId || (sourceItem?.type === 'Folder' ? sourceItem.id : undefined);
        return <FileExplorerWindow 
                    desktopModel={desktopModel} 
                    windowId={id} 
                    initialPath={initialPath} 
                    folderId={folderIdToUse} 
                />;

      case "weatherapp":
      case dynamicIdPrefix === "weatherapp":
        return <WeatherApp />;
      
      case "todolist":
      case dynamicIdPrefix === "todolist":
        return <TodoList />;
      
      default:
        // Handle project-specific apps (skills/experience shown through projects)
        if (effectiveType?.startsWith('project-')) {
          const projectId = effectiveType.substring('project-'.length);
          const projectData = portfolioProjects.find(p => p.id === projectId);
          if (projectData) {
            return <ProjectWindow project={projectData} />;
          }
        }
        console.warn(`[WindowManager] Unknown effectiveType: '${effectiveType}' for window '${window.title}' (ID: ${id}). Content type was: '${contentType}'. SourceItem type: '${sourceItem?.type}'`);
        return <DefaultWindowContent type={effectiveType || 'Unknown'} />;
    }
  }, [desktopModel]); 

  return (
    <div ref={containerRef} className="window-manager-container">
      {visibleWindows.map(win => (
        <ErrorBoundary key={win.id} fallback={<DefaultWindowContent type={`Error in ${win.title}`} />}>
          <WindowComponent 
            model={win} // Pass the full WindowModel instance
            desktopModel={desktopModel}
            forceUpdate={forceUpdate}
            // className, resizable can be added if needed based on model or type
            >
            {renderWindowContent(win)}
          </WindowComponent>
        </ErrorBoundary>
      ))}
    </div>
  );
};

export default WindowManager;