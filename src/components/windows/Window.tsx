import React, { useRef, useState, useEffect } from 'react';
import { useDraggable } from '@neodrag/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowMinimize, faWindowMaximize, faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { useDesktop } from '../../context/DesktopContext';
import styles from '../styles/Window.module.scss';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  resizable?: boolean;
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  children,
  initialPosition = { x: 50, y: 50 },
  initialSize = { width: 500, height: 400 },
  resizable = true,
}) => {
  const { state, dispatch } = useDesktop();
  const windowRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const isActive = state.activeWindowId === id;
  const isMinimizedState = state.windows.find(w => w.id === id)?.minimized || false;

  // Apply draggable ref directly to the window component
  useDraggable(windowRef as React.RefObject<HTMLElement>, {
    position: initialPosition,
    onDrag: () => {
      if (!isDragging) setIsDragging(true);
      if (!isActive) {
        dispatch({ type: 'FOCUS_WINDOW', payload: { id } });
      }
    },
    onDragEnd: () => {
      setIsDragging(false);
    },
    bounds: 'parent',
  });

  // Prevent click propagation during drag
  useEffect(() => {
    const preventClickDuringDrag = (e: MouseEvent) => {
      if (isDragging || isResizing) {
        e.stopPropagation();
      }
    };
    document.addEventListener('click', preventClickDuringDrag, { capture: true });
    return () => {
      document.removeEventListener('click', preventClickDuringDrag, { capture: true });
    };
  }, [isDragging, isResizing]);

  // Handle window focus on click
  const handleWindowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActive) {
      dispatch({ type: 'FOCUS_WINDOW', payload: { id } });
    }
  };

  // Window controls
  const handleClose = () => {
    dispatch({ type: 'CLOSE_WINDOW', payload: { id } });
  };

  const handleMinimize = () => {
    dispatch({ type: 'MINIMIZE_WINDOW', payload: { id } });
  };

  const handleMaximize = () => {
    if (size.width === window.innerWidth - 20) {
      setSize(initialSize); // Restore to original size
    } else {
      setSize({
        width: window.innerWidth - 20,
        height: window.innerHeight - 80,
      }); // Maximize
    }
  };

  // Handle resize functionality
  const handleResize = () => {
    setIsResizing(true);
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        const newWidth = Math.max(300, moveEvent.clientX - rect.left);
        const newHeight = Math.max(200, moveEvent.clientY - rect.top);
        setSize({ width: newWidth, height: newHeight });
      }
    };
    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Early return if minimized - MOVED AFTER all hooks
  if (isMinimizedState) return null;

  return (
    <div 
      ref={windowRef}
      className={`${styles.window} ${isActive ? styles.active : ''}`}
      style={{ 
        width: size.width, 
        height: size.height,
        zIndex: isActive ? 10 : 1
      }}
      onClick={handleWindowClick}
    >
      <div className={`${styles.titleBar} window-title-bar`}>
        <div className={styles.title}>{title}</div>
        <div className={styles.controls}>
          <button onClick={handleMinimize} className={styles.control}>
            <FontAwesomeIcon icon={faWindowMinimize} />
          </button>
          <button onClick={handleMaximize} className={styles.control}>
            <FontAwesomeIcon icon={faWindowMaximize} />
          </button>
          <button onClick={handleClose} className={styles.control}>
            <FontAwesomeIcon icon={faWindowClose} />
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
      {resizable && (
        <div 
          className={styles.resizeHandle}
          onMouseDown={handleResize}
        />
      )}
    </div>
  );
};

export default Window;