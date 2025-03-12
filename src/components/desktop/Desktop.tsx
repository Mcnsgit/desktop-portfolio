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
  const { playSound } = useSounds();
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; position: { x: number; y: number } }>({
    visible: false,
    position: { x: 0, y: 0 },
  });

  // Local state for start menu (backup approach)
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  useKeyboardShortcuts();
  const backgrounds = useMemo(() => [
    BackgroundImages?.retro_background_1 || '/backgrounds/bg1.jpg',
    BackgroundImages?.retro_background_2 || '/backgrounds/bg2.jpg',
    BackgroundImages?.retro_background_3 || '/backgrounds/bg3.jpg',
  ], []);

  useEffect(() => {
    playSound('startup');

    // Debug the state of the Desktop context
    console.log("Desktop initialized with state:", state);
  }, [playSound, state]);

  // Sync local state with context state
  useEffect(() => {
    setIsStartMenuOpen(state.startMenuOpen);
  }, [state.startMenuOpen]);


  const handleDesktopClick = useCallback(() => {
    if (state.startMenuOpen) {
      dispatch({ type: 'TOGGLE_START_MENU' });
      setIsStartMenuOpen(false);
    }
    if (contextMenu.visible) {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  }, [state.startMenuOpen, contextMenu.visible, dispatch]);

  const cycleBackground = useCallback(() => {
    setBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
    playSound('click');
  }, [backgrounds.length, playSound]);

  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    playSound('click');
    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
    });
  }, [playSound]);

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

  const filteredProjects = useMemo(() =>
    state.projects.filter((p) => p.id !== 'about'),
    [state.projects]
  );

  const handleAboutMeClick = useCallback((e?: React.MouseEvent) => {
    // If event is passed, stop propagation
    if (e) e.stopPropagation();

    // Debug log
    console.log("About Me clicked, projects:", state.projects);

    playSound('click');
    playSound('windowOpen');

    // Dispatch window open action with explicit parameters
    dispatch({
      type: 'OPEN_WINDOW',
      payload: {
        id: 'about',
        title: 'About Me',
        content: 'about', // Use a simple string identifier
        minimized: false,
        position: { x: 150, y: 100 },
        size: { width: 500, height: 400 },
      },
    });
  }, [dispatch, playSound, state.projects]);

  // Handle Start Menu toggle - direct approach
  const handleStartClick = useCallback(() => {
    playSound('click');
    console.log("Start menu toggle - current state:", state.startMenuOpen);
    dispatch({ type: 'TOGGLE_START_MENU' });
    setIsStartMenuOpen(!isStartMenuOpen); // Backup approach
  }, [dispatch, playSound, state.startMenuOpen, isStartMenuOpen]);

  const iconElements = useMemo(() => {
    return filteredProjects.map((project, index) => {
      const col = Math.floor(index / 5);
      const row = index % 5;
      return (
        <Icon
          key={project.id}
          position={{ x: 20 + col * 100, y: 20 + row * 100 }}
          icon={project.icon || `icons/${project.id}.png`} // Fallback icon path
          label={project.title}
          onDoubleClick={() => handleIconDoubleClick(project.id)}
        />
      );
    });
  }, [filteredProjects, handleIconDoubleClick]);

  // Render function to ensure StartMenu shows under both states
  const renderStartMenu = () => {
    return (state.startMenuOpen || isStartMenuOpen) ? <StartMenu /> : null;
  };

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
        <Icon
          position={{ x: 20, y: 20 + (filteredProjects.length % 5) * 100 }}
          icon="icons/about.png" // Removed leading slash
          label="About Me"
          onDoubleClick={handleAboutMeClick}
        />
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
};

export default Desktop;