// components/windows/WindowManager.tsx
import React, { useEffect } from "react";
import { useDesktop } from "../../context/DesktopContext";
import Window from "./Window";
import AboutWindow from "./WindowTypes/AboutWindow";
import ProjectWindow from "./WindowTypes/ProjectWindow";
//import FolderWindow from './WindowTypes/FolderWindow';
import { Project } from "../../types";

const WindowManager: React.FC = () => {
  const { state } = useDesktop();

  // Debug logging
  useEffect(() => {
    console.log("WindowManager rendering with windows:", state.windows);
  }, [state.windows]);

  if (state.windows.length === 0) {
    console.log("No windows to render");
    return null;
  }

  return (
    <>
      {state.windows.map((window) => {
        // Debug logging for each window
        console.log(`Rendering window:`, {
          id: window.id,
          title: window.title,
          type: window.type,
          content:
            typeof window.content === "string" ? window.content : "Component",
        });

        // About Me window
        if (window.id === "about") {
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

        //// Folder windows
        //if (window.type === 'folder' || window.id.startsWith('folder-')) {
        //  // Extract folder ID - either from content or from ID
        //  const folderId = typeof window.content === 'string'
        //    ? window.content
        //    : window.id.replace('folder-', '');

        //  console.log(`Rendering Folder window for folder ID: ${folderId}`);

        //  return (
        //    <Window
        //      key={window.id}
        //      id={window.id}
        //      title={window.title}
        //      initialPosition={window.position}
        //      initialSize={window.size || { width: 500, height: 400 }}
        //    >
        //      <FolderWindow folderId={folderId} />
        //    </Window>
        //  );
        //}

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
    </>
  );
};

export default WindowManager;
