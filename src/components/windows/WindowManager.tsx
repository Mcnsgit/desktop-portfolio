// components/windows/WindowManager.tsx
import React from 'react';
import { useDesktop } from '../../context/DesktopContext';
import Window from './Window';
import AboutWindow from './WindowTypes/AboutWindow';
import ProjectWindow from './WindowTypes/ProjectWindow';
import { Project } from '../../types';

const WindowManager: React.FC = () => {
  const { state } = useDesktop();
  
  return (
    <>
      {state.windows.map(window => {
        // Determine window type based on content
        if (window.id === 'about') {
          return (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              initialPosition={window.position}

            >
              <AboutWindow />
            </Window>
          );
        }
        
        // Project windows
        if (window.id.startsWith('project-')) {
          return (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              initialPosition={window.position}

            >
              <ProjectWindow project={window.content as unknown as Project} />
            </Window>
          );
        }
        
        // Default empty window
        return (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            initialPosition={window.position}

          >
            <div>Content not available</div>
          </Window>
        );
      })}
    </>
  );
};

export default WindowManager;