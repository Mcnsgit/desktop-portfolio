// components/desktop/Desktop.tsx
import React, { useState, useEffect } from 'react';
import { useDesktop } from '../../context/DesktopContext';
import Icon from './Icon';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import WindowManager from '../windows/WindowManager';
import RightClickMenu from './rigthClickMenu';
import { useSounds } from '../../hooks/useSounds';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import styles from '../styles/Desktop.module.scss';
import {BackgroundImages} from  '../../../public/backgrounds/BackgroundImages';



const Desktop: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const { playSound } = useSounds();
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
  }>({
    visible: false,
    position: { x: 0, y: 0 }
  });
  
  // Use keyboard shortcuts
  useKeyboardShortcuts();
  
  const backgrounds = [
    BackgroundImages.retro_background_1,
    BackgroundImages.retro_background_2,
    BackgroundImages.retro_background_3
  ];
  
  // Play startup sound when desktop loads
  useEffect(() => {
    playSound('startup');
  }, [playSound]);
  
  // Handle click on desktop to close start menu if open
  const handleDesktopClick = () => {
    if (state.startMenuOpen) {
      dispatch({ type: 'TOGGLE_START_MENU' });
    }
    // Close context menu if it's open
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  };
  
  // Cycle through backgrounds
  const cycleBackground = () => {
    setBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
    playSound('click');
  };
  
  // Handle right-click on desktop
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Show context menu at the click position
    playSound('click');
    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY }
    });
  };
  
  // Context menu items
  const contextMenuItems = [
    {
      label: 'Change Background',
      action: cycleBackground,
    },
    {
      label: 'Arrange Icons',
      action: () => console.log('Arrange icons'),
    },
    {
      label: 'Refresh',
      action: () => window.location.reload(),
    }
  ];
  
  // Handle icon double-click to open window
  const handleIconDoubleClick = (projectId: string) => {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      playSound('windowOpen');
      dispatch({
        type: 'OPEN_WINDOW',
        payload: {
          id: `project-${project.id}`,
          title: project.title,
          content: project.content,
          minimized: false,
          position: { x: 100, y: 100 },
        }
      });
    }
  };
  
  // Filter out the about project from regular projects if it exists
  const filteredProjects = state.projects.filter(p => p.id !== 'about');
  
  // Check if about project exists in the projects list
  const aboutProject = state.projects.find(p => p.id === 'about');
  
  // Render desktop icons in a grid
  const renderIcons = () => {
    return filteredProjects.map((project, index) => {
      const col = Math.floor(index / 5);
      const row = index % 5;
      return (
        <Icon
          key={project.id}
          position={{ x: 20 + col * 100, y: 20 + row * 100 }}
          icon={project.icon}
          label={project.title}
          onDoubleClick={() => handleIconDoubleClick(project.id)}
        />
      );
    });
  };
  
  // Handle About Me icon click
  const handleAboutMeClick = () => {
    playSound('click');
    playSound('windowOpen');
    dispatch({
      type: 'OPEN_WINDOW',
      payload: {
        id: 'about',
        title: 'About Me',
        content: null,
        minimized: false,
        position: { x: 150, y: 100 },
      }
    });
  };
  
  return (
    <div 
      className={styles.desktop}
      style={{ backgroundImage: `url(${backgrounds[backgroundIndex]})` }}
      onClick={handleDesktopClick}
      onContextMenu={handleRightClick}
    >
      <div className={styles.iconsContainer}>
        {renderIcons()}
        
        {/* Special "About Me" icon - use it only if not already in projects */}
        <Icon
          position={{ x: 20, y: 20 + filteredProjects.length % 5 * 100 }}
          icon="/icons/about.png" // Convert ico to png for web use
          label="About Me"
          onDoubleClick={handleAboutMeClick}
        />
      </div>
      <WindowManager />
      <StartMenu />
      
      {contextMenu.visible && (
        <RightClickMenu
          position={contextMenu.position}
          items={contextMenuItems}
          onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        />
      )}
      
      <Taskbar onStartClick={() => {
        playSound('click');
        dispatch({ type: 'TOGGLE_START_MENU' });
      }} />
    </div>
  );
};

export default Desktop;