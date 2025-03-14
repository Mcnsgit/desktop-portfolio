// components/desktop/Desktop.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDesktop } from '../../context/DesktopContext';
import Icon from './Icon';
import Folder from './Folder';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import WindowManager from '../windows/WindowManager';
import RightClickMenu from './rigthClickMenu';
import { useSounds } from '../../hooks/useSounds';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import styles from '../styles/Desktop.module.scss';
import { BackgroundImages } from '../../../public/backgrounds/BackgroundImages';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package

const Desktop: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const { playSound } = useSounds();
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; position: { x: number; y: number } }>({
    visible: false,
    position: { x: 0, y: 0 },
  });
  
  // Track which desktop item is being dragged
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  
  useKeyboardShortcuts();
  
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
      dispatch({ type: 'TOGGLE_START_MENU', payload: { startMenuOpen: false } });
    }
    if (contextMenu.visible) {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  }, [state.startMenuOpen, contextMenu.visible, dispatch]);
  
  const cycleBackground = useCallback(() => {
    setBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
    playSound('click');
  }, [backgrounds.length, playSound]);
  
  // Handle right-click context menu
  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    playSound('click');
    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
    });
  }, [playSound]);
  
  // Right-click menu items
  const contextMenuItems = useMemo(() => [
    {
      label: 'Change Background',
      action: cycleBackground,
    },
    {
      label: 'New Folder',
      action: () => {
        const folderId = uuidv4(); // Generate unique ID
        dispatch({
          type: 'CREATE_FOLDER',
          payload: {
            id: folderId,
            title: 'New Folder',
            icon: '/assets/win98-icons/png/directory_closed-0.png',
            items: [],
            position: { 
              x: Math.max(50, contextMenu.position.x - 40), 
              y: Math.max(50, contextMenu.position.y - 40) 
            }
          }
        });
      },
    },
    {
      label: 'Arrange Icons',
      action: () => console.log('Arrange icons'),
    },
    {
      label: 'Refresh',
      action: () => window.location.reload(),
    },
  ], [cycleBackground, contextMenu.position, dispatch]);
  
  // Handle opening a project window
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
          type: 'project'
        },
      });
    }
  }, [dispatch, playSound, state.projects]);
  
  // Handle opening About me window
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
  
  // Toggle start menu
  const handleStartClick = useCallback(() => {
    console.log("Start menu toggle - current state:", state.startMenuOpen);
    dispatch({ type: 'TOGGLE_START_MENU' });
  }, [dispatch, state.startMenuOpen]);
  
  // Drag handlers

  const handleDragStart = useCallback((e: React.DragEvent, itemId?: string) => {
    if (itemId) {
      setDraggedItemId(itemId);
      e.dataTransfer.setData('text/plain', itemId);
      e.dataTransfer.effectAllowed = 'move';
    }
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    
    if (!itemId) return;
    
    // Get desktop-relative position
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const dropX = Math.max(20, e.clientX - left);
    const dropY = Math.max(20, e.clientY - top);
    
    // Move to desktop (null parent)
    dispatch({
      type: 'MOVE_ITEM',
      payload: {
        itemId,
        newParentId: null,
        position: { x: dropX, y: dropY }
      }
    });
    
    setDraggedItemId(null);
  }, [dispatch]);
  
  // Get items currently on the desktop (not in folders)
  const desktopItems = useMemo(() => {
    return state.desktopItems.filter(item => !item.parentId);
  }, [state.desktopItems]);
  
  // Get desktop projects (excluding About Me)
  const desktopProjects = useMemo(() => {
    return desktopItems
      .filter(item => item.type === 'project' && item.id !== 'about')
      .map(item => {
        const project = state.projects.find(p => p.id === item.id);
        return { ...item, project };
      })
      .filter(item => item.project); // Ensure project exists
  }, [desktopItems, state.projects]);
  
  // Get desktop folders
  const desktopFolders = useMemo(() => {
    return desktopItems.filter(item => item.type === 'folder');
  }, [desktopItems]);
  
  // About Me icon
  const aboutMeItem = useMemo(() => {
    return state.desktopItems.find(item => item.id === 'about' && !item.parentId);
  }, [state.desktopItems]);
  
  const aboutMeProject = useMemo(() => {
    return state.projects.find(p => p.id === 'about');
  }, [state.projects]);
  
  // Render start menu (only if open)
  const renderStartMenu = useCallback(() => {
    return state.startMenuOpen ? <StartMenu /> : null;
  }, [state.startMenuOpen]);
  
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
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={styles.iconsContainer}>
        {/* Render project icons */}
        {desktopProjects.map(item => (
          <Icon
          key={item.id}
          itemId={item.id}
          position={item.position}
          icon={item.project?.icon || '/assets/win98-icons/png/notepad_file-0.png'}
          label={item.project?.title || 'Unknown'}
          onDoubleClick={() => handleIconDoubleClick(item.id)}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, item.id)} // Pass item.id here
        />
        ))}
        
        {/* Render folder icons */}
        {desktopFolders.map(folder => (
         <Folder
         key={folder.id}
         id={folder.id}
         title={folder.title}
         position={folder.position}
         onDragStart={(e) => handleDragStart(e, folder.id)} // Pass folder.id here
         onDragOver={handleDragOver}
         onDrop={(e, folderId) => {
           e.preventDefault();
           const itemId = e.dataTransfer.getData('text/plain');
           if (itemId) {
             dispatch({
               type: 'MOVE_ITEM',
               payload: {
                 itemId,
                 newParentId: folderId
               }
             });
           }
         }}
       />
       
        ))}
        
        {/* About Me icon */}
        {aboutMeProject && !aboutMeItem && (
          <Icon
            position={{ x: 20, y: 20 }}
            icon="/assets/win98-icons/png/address_book_user.png"
            label="About Me"
            onDoubleClick={handleAboutMeClick}
            itemId="about"
            draggable={true}
            onDragStart={handleDragStart}
          />
        )}
        
        {aboutMeItem && aboutMeProject && (
          <Icon
            position={aboutMeItem.position}
            icon={aboutMeProject.icon || "/assets/win98-icons/png/address_book_user.png"}
            label={aboutMeItem.title}
            onDoubleClick={handleAboutMeClick}
            itemId={aboutMeItem.id}
            draggable={true}
            onDragStart={handleDragStart}
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
};

export default Desktop;