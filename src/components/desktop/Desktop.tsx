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
  useKeyboardShortcuts();
  const backgrounds = [
    BackgroundImages.retro_background_1,
    BackgroundImages.retro_background_2,
    BackgroundImages.retro_background_3,
  ];
  useEffect(() => {
    playSound('startup');
  }, [playSound]);
  const handleDesktopClick = () => {
    if (state.startMenuOpen) {
      dispatch({ type: 'TOGGLE_START_MENU' });
    }
    if (contextMenu.visible) {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  };
  const cycleBackground = useCallback(() => {
    setBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
    playSound('click');
  }, [backgrounds.length, playSound]);
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playSound('click');
    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
    });
  };
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
  const handleAboutMeClick = useCallback(() => {
    const aboutProject = state.projects.find((p) => p.id === 'about');
    if (aboutProject) {
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
        },
      });
    }
  }, [dispatch, playSound, state.projects]);
  const renderIcons = useMemo(() => {
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
  }, [filteredProjects, handleIconDoubleClick]);
  return (
    <div
      className={styles.desktop}
      style={{ backgroundImage: `url(${backgrounds[backgroundIndex]})` }}
      onClick={handleDesktopClick}
      onContextMenu={handleRightClick}
    >
      <div className={styles.iconsContainer}>
        {renderIcons}
        <Icon
          position={{ x: 20, y: 20 + filteredProjects.length % 5 * 100 }}
          icon="/icons/about.png"
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
          onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
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