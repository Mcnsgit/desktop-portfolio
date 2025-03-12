import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDesktop } from '../../context/DesktopContext';
import Icon from './Icon';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import WindowManager from '../windows/WindowManager';
import RightClickMenu from './rigthClickMenu';
import { useSounds } from '../../hooks/useSounds';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import styles from '../styles/Desktop.module.scss';
import { BackgroundImages } from '../../../public/backgrounds/BackgroundImages';
const Desktop: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [clicks, setClicks] = useState(0);
  const { playSound } = useSounds();
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; position: { x: number; y: number } }>({
    visible: false,
    position: { x: 0, y: 0 },
  });
  const doSingleClickThing = useCallback(() => {
    console.log('single clicked!');
    playSound("click");
  }, [playSound]);
  const doDoubleClickThing = useCallback(() => {
    console.log('double clicked!');
    playSound("doubleClick");
  }, [playSound]);
  useEffect(() => {
    let singleClickTimer: NodeJS.Timeout;
    if (clicks === 1) {
      singleClickTimer = setTimeout(() => {
        doSingleClickThing();
        setClicks(0);
      }, 250);
    } else if (clicks === 2) {
      doDoubleClickThing();
      setClicks(0);
    }
    return () => clearTimeout(singleClickTimer);
  }, [clicks, doSingleClickThing, doDoubleClickThing]);
  useKeyboardShortcuts();
  // Removed unnecessary useMemo for static backgrounds
  const backgrounds = [
    BackgroundImages?.retro_background_1 || '/backgrounds/bg1.jpg',
    BackgroundImages?.retro_background_2 || '/backgrounds/bg2.jpg',
    BackgroundImages?.retro_background_3 || '/backgrounds/bg3.jpg',
  ];
  useEffect(() => {
    console.log("Desktop initialized with state:", state);
  }, [state]);
  const handleDesktopClick = useCallback(() => {
    if (state.startMenuOpen) {
      dispatch({ type: 'TOGGLE_START_MENU' });
    }
    if (contextMenu.visible) {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  }, [state.startMenuOpen, contextMenu.visible, dispatch]);
  const cycleBackground = useCallback(() => {
    setBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
  }, [backgrounds.length]);
  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
    });
  }, []);
  const contextMenuItems = useMemo(() => [
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
    },
  ], [cycleBackground]);
  const handleIconDoubleClick = useCallback((projectId: string) => {
    const project = state.projects.find((p) => p.id === projectId);
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
        },
      });
    }
  }, [dispatch, playSound, state.projects]);
  const filteredProjects = useMemo(() => state.projects.filter((p) => p.id !== 'about'), [state.projects]);
  const handleAboutMeClick = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    console.log("About Me clicked, projects:", state.projects);
    playSound('click');
    playSound('windowOpen');
    dispatch({
      type: 'OPEN_WINDOW',
      payload: {
        id: 'about',
        title: 'About Me',
        content: 'about',
        minimized: false,
        position: { x: 150, y: 100 },
        size: { width: 500, height: 400 },
      },
    });
  }, [dispatch, playSound, state.projects]);
  const handleStartClick = useCallback(() => {
    console.log("Start menu toggle - current state:", state.startMenuOpen);
    dispatch({ type: 'TOGGLE_START_MENU' });
  }, [dispatch, state.startMenuOpen]);


  const iconElements = useMemo(() => {
    return filteredProjects.map((project, index) => {
      const GRID_COLUMN_WIDTH = 100;
      const GRID_ROW_HEIGHT = 120;
      const GRID_COLUMNS = 5;

      const col = Math.floor(index % GRID_COLUMNS);
      const row = Math.floor(index / GRID_COLUMNS);
      // Try to use the icon from the project, or use a fallback based on project type
      let iconPath = project.icon;

      // Provide fallbacks if icon is missing
      if (!iconPath || iconPath.includes("../assets")) {
        // Convert relative paths to absolute
        iconPath = iconPath?.replace("../assets", "/assets");

        // If still no icon, use a default based on project type
        if (!iconPath) {
          switch (project.type) {
            case 'code':
              iconPath = '/assets/win98-icons/png/notepad_file-0.png';
              break;
            case 'interactive':
              iconPath = '/assets/win98-icons/png/joystick-5.png';
              break;
            case 'visual':
              iconPath = '/assets/win98-icons/png/media_player_file-0.png';
              break;
            default:
              iconPath = '/assets/win98-icons/png/briefcase-4.png';
          }
        }
      }

      console.log(`Project ${project.id}: using icon ${iconPath}`);

      return (
        <Icon
          key={project.id}
          position={{
            x: 20 + col * GRID_COLUMN_WIDTH,
            y: 20 + row * GRID_ROW_HEIGHT
          }}
          icon={iconPath}
          label={project.title}
          onDoubleClick={() => handleIconDoubleClick(project.id)}
        />
      );
    });
  }, [filteredProjects, handleIconDoubleClick]);
  
  const renderStartMenu = () => {
    return state.startMenuOpen ? <StartMenu /> : null;
  };

  // And the About Me icon with appropriate spacing
  return (
    <div
      className={styles.desktop}
      style={{
        backgroundImage: `url(${backgrounds[backgroundIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      onClick={handleDesktopClick}
      onContextMenu={handleRightClick}
    >
      <div className={styles.iconsContainer}>
        {iconElements}
        {/* Only show About Me icon if not already in projects */}
        {!state.projects.some(p => p.id === 'about') && (
          <Icon
            position={{
              x: 20,
              y: 20 + Math.ceil(filteredProjects.length / 5) * 120
            }}
            icon="/assets/win98-icons/png/address_book_user.png"
            label="About Me"
            onDoubleClick={handleAboutMeClick}
          />
        )}
      </div>
      <WindowManager />
      {renderStartMenu()}
      {contextMenu.visible && (
        <RightClickMenu
          position={contextMenu.position}
          items={contextMenuItems}
          onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
        />
      )}
      <Taskbar onStartClick={handleStartClick} />
    </div>
  );
}
export default Desktop;