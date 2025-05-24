// src/components/windows/Window.tsx
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Draggable from 'react-draggable';
import {
  ArrowsInLineVertical,
  FrameCorners,
  XSquare,
} from "@phosphor-icons/react";
import { useDesktop } from "../../context/DesktopContext";
import { useSounds } from "@/hooks/useSounds";
import styles from "./Window.module.scss";

// Constants from your windowConstants
const Z_INDEX = {
  WINDOW_NORMAL: 1000,
  WINDOW_FOCUSED: 1100
};

const WINDOW_POSITIONS = {
  BASE_OFFSET_X: 50,
  BASE_OFFSET_Y: 50,
  TASKBAR_HEIGHT: 30
};

const WINDOW_SIZE_CONSTRAINTS = {
  MIN_WIDTH: 300,
  MIN_HEIGHT: 200,
  DEFAULT_WIDTH: 600,
  DEFAULT_HEIGHT: 400
};

const WINDOW_ANIMATIONS = {
  CLOSE_DURATION: 300,
  MINIMIZE_DURATION: 300,
  MAXIMIZE_DURATION: 300
};

const TIMING = {
  POSITION_UPDATE_DEBOUNCE: 100,
  ANIMATION_BUFFER: 50,
  SAVE_DELAY: 200
};

// Types
interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  resizable?: boolean;
  className?: string;
}

interface WindowState {
  preMaximizedState: {
    position: { x: number; y: number };
    size: { width: number; height: number };
  } | null;
  animationClass: string;
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  children,
  initialPosition = { x: WINDOW_POSITIONS.BASE_OFFSET_X, y: WINDOW_POSITIONS.BASE_OFFSET_Y },
  initialSize = { width: WINDOW_SIZE_CONSTRAINTS.DEFAULT_WIDTH, height: WINDOW_SIZE_CONSTRAINTS.DEFAULT_HEIGHT },
  resizable = true,
  className = '',
}) => {
  const { state, dispatch } = useDesktop();
  const { playSound } = useSounds();
  const windowRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const isUpdatingState = useRef(false);

  // State for window maximization and animations
  const [windowState, setWindowState] = useState<WindowState>({
    preMaximizedState: null,
    animationClass: ''
  });

  // Get window data from the global state
  const windowData = useMemo(() =>
    state.windows.find(w => w.id === id),
    [state.windows, id]
  );

  // Derived states
  const isActive = state.activeWindowId === id;
  const isMinimized = windowData?.minimized || false;
  const isMaximized = !!windowState.preMaximizedState;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // New effect to ensure animationClass is cleared when window is not minimized
  useEffect(() => {
    if (windowData && !windowData.minimized && (windowState.animationClass === 'minimizing' || windowState.animationClass === 'closing')) {
      setWindowState(prev => ({ ...prev, animationClass: '' }));
    }
    // Ensure preMaximizedState is cleared if the window is no longer considered maximized by context/props
    // This might be redundant if handleMaximize already covers it, but acts as a safeguard.
    if (windowData && !windowData.isMaximized && windowState.preMaximizedState) {
      // Assuming windowData can have an isMaximized property reflecting context truth
      // If not, this part of the condition might need adjustment or removal.
      // For now, let's focus on the animationClass.
    }

  }, [windowData, windowState.animationClass, windowState.preMaximizedState]); // Depend on windowData (for minimized status) and animationClass

  // Handle drag stop with debounce
  const handleDragStop = (e: any, data: any) => {
    e.stopPropagation();
    if (isUpdatingState.current) return;

    const finalPosition = {
      x: Math.max(0, data.x),
      y: Math.max(0, data.y)
    };

    console.log('Window Drag Stop - ID:', id, 'Raw Data:', data, 'Final Position:', finalPosition);

    // Only update if position actually changed
    if (windowData?.position &&
      (Math.abs(windowData.position.x - finalPosition.x) > 1 ||
        Math.abs(windowData.position.y - finalPosition.y) > 1)) {
      dispatch({
        type: 'UPDATE_WINDOW_POSITION',
        payload: { id, position: finalPosition }
      });
    }
  };

  // Window focus handling
  const handleDragStart = useCallback(() => {
    if (!isActive && !isUpdatingState.current) {
      isUpdatingState.current = true;
      dispatch({ type: 'FOCUS_WINDOW', payload: { id } });
      playSound("click"); // Adjust sound name as needed
      setTimeout(() => {
        isUpdatingState.current = false;
      }, 50);
    }
  }, [isActive, dispatch, id, playSound]);

  // Close window with animation
  const handleClose = useCallback(() => {
    if (isUpdatingState.current) return;
    isUpdatingState.current = true;

    playSound("windowClose");
    setWindowState(prev => ({ ...prev, animationClass: 'closing' }));

    setTimeout(() => {
      if (isMounted.current) {
        dispatch({ type: "CLOSE_WINDOW", payload: { id } });
      }
    }, WINDOW_ANIMATIONS.CLOSE_DURATION);
  }, [dispatch, id, playSound]);

  // Minimize window with animation
  const handleMinimize = useCallback(() => {
    if (isUpdatingState.current) return;
    isUpdatingState.current = true;

    setWindowState(prev => ({ ...prev, animationClass: 'minimizing' }));
    playSound("click");

    setTimeout(() => {
      if (isMounted.current) {
        dispatch({ type: "MINIMIZE_WINDOW", payload: { id } });
        isUpdatingState.current = false;
      }
    }, WINDOW_ANIMATIONS.MINIMIZE_DURATION);
  }, [dispatch, id, playSound]);

  // Toggle maximize/restore
  const handleMaximize = useCallback(() => {
    if (!resizable || isUpdatingState.current) return;
    isUpdatingState.current = true;

    console.log('Maximize/Restore toggled, current state:', {
      isMaximized,
      preMaximizedState: windowState.preMaximizedState
    });

    if (isMaximized) {
      // Restore window
      setWindowState(prev => ({ ...prev, animationClass: 'restoring' }));
      playSound("click");

      if (windowState.preMaximizedState) {
        const { position, size } = windowState.preMaximizedState;
        console.log('Restoring window to:', { position, size });

        // Use separate dispatches to ensure both updates are processed
        dispatch({
          type: "UPDATE_WINDOW_SIZE",
          payload: { id, size }
        });

        dispatch({
          type: "UPDATE_WINDOW_POSITION",
          payload: { id, position }
        });

        // Clear maximized state
        setWindowState(prev => ({ ...prev, preMaximizedState: null }));
      } else {
        // Fallback if preMaximizedState is missing
        console.warn('No preMaximizedState found, using defaults');
        dispatch({
          type: "UPDATE_WINDOW_SIZE",
          payload: { id, size: initialSize }
        });

        dispatch({
          type: "UPDATE_WINDOW_POSITION",
          payload: { id, position: initialPosition }
        });
      }
    } else {
      // Maximize window - Save current state first
      const currentPosition = windowData?.position || initialPosition;
      const currentSize = windowData?.size || initialSize;

      console.log('Saving window state before maximizing:', {
        position: currentPosition,
        size: currentSize
      });

      setWindowState(prev => ({
        ...prev,
        animationClass: 'maximizing',
        preMaximizedState: {
          position: currentPosition,
          size: currentSize,
        }
      }));

      playSound("click");

      const maximizedSize = {
        width: window.innerWidth - 4,
        height: window.innerHeight - WINDOW_POSITIONS.TASKBAR_HEIGHT - 4,
      };

      // Use separate dispatches for more reliable updates
      dispatch({
        type: "UPDATE_WINDOW_SIZE",
        payload: { id, size: maximizedSize }
      });

      dispatch({
        type: "UPDATE_WINDOW_POSITION",
        payload: { id, position: { x: 0, y: 0 } }
      });
    }

    // Reset animation class after animation completes
    setTimeout(() => {
      if (isMounted.current) {
        setWindowState(prev => ({ ...prev, animationClass: '' }));
        isUpdatingState.current = false;
      }
    }, WINDOW_ANIMATIONS.MAXIMIZE_DURATION + TIMING.ANIMATION_BUFFER);
  }, [
    resizable, isMaximized, windowState.preMaximizedState, windowData, id,
    initialPosition, initialSize, dispatch, playSound
  ]);

  // Double-click on title bar to toggle maximize
  const handleTitleDoubleClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-window-control]") || !resizable) {
      return;
    }
    handleMaximize();
  }, [handleMaximize, resizable]);

  // Window CSS classes
  // const windowClasses = useMemo(() => {
  //   return [
  //     styles.window,
  //     isActive ? styles.active : "",
  //     isMaximized ? styles.maximized : "",
  //     windowState.animationClass ? styles[windowState.animationClass] : "",
  //     className,
  //   ].filter(Boolean).join(" ");
  // }, [isActive, isMaximized, windowState.animationClass, className]);

  // Handle window styles dynamically
  const windowStyle = useMemo(() => {
    const size = windowData?.size || initialSize;

    // Create a base style object
    const style: React.CSSProperties = {
      position: 'absolute',
      visibility: isMinimized ? 'hidden' : 'visible',
      display: isMinimized ? 'none' : 'block',
      pointerEvents: isMinimized ? 'none' : 'auto',
      overflow: 'hidden',
      zIndex: windowData?.zIndex || Z_INDEX.WINDOW_NORMAL,
    };

    // Handle maximized state differently
    if (isMaximized) {
      // Use explicit values for maximized state
      style.width = "calc(100vw - 4px)";
      style.height = `calc(100vh - ${WINDOW_POSITIONS.TASKBAR_HEIGHT + 4}px)`;
      style.top = 0;
      style.left = 0;
      style.right = 0;
      style.bottom = WINDOW_POSITIONS.TASKBAR_HEIGHT + 'px';
    } else {
      // Use specific dimensions for non-maximized state
      style.width = `${size.width}px`;
      style.height = `${size.height}px`;
      // Position is handled by Draggable, so we don't set top/left here

      // Add minimum constraints
      style.minWidth = `${WINDOW_SIZE_CONSTRAINTS.MIN_WIDTH}px`;
      style.minHeight = `${WINDOW_SIZE_CONSTRAINTS.MIN_HEIGHT}px`;
    }

    return style;
  }, [isMinimized, isMaximized, windowData, initialSize]);

  // Resize handler
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    if (!resizable || isMaximized || isUpdatingState.current) return;
    e.preventDefault();
    e.stopPropagation();
    isUpdatingState.current = true;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowRef.current?.offsetWidth || initialSize.width;
    const startHeight = windowRef.current?.offsetHeight || initialSize.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!windowRef.current) return;

      let newWidth = startWidth + (moveEvent.clientX - startX);
      let newHeight = startHeight + (moveEvent.clientY - startY);

      // Apply constraints
      newWidth = Math.max(WINDOW_SIZE_CONSTRAINTS.MIN_WIDTH, newWidth);
      newHeight = Math.max(WINDOW_SIZE_CONSTRAINTS.MIN_HEIGHT, newHeight);

      // Apply directly to DOM for smoothness
      windowRef.current.style.width = `${newWidth}px`;
      windowRef.current.style.height = `${newHeight}px`;
    };

    const onMouseUp = () => {
      if (windowRef.current) {
        const finalWidth = windowRef.current.offsetWidth;
        const finalHeight = windowRef.current.offsetHeight;

        // Update state after resize completes
        setTimeout(() => {
          if (isMounted.current) {
            dispatch({
              type: "UPDATE_WINDOW_SIZE",
              payload: { id, size: { width: finalWidth, height: finalHeight } }
            });
            isUpdatingState.current = false;
          }
        }, TIMING.SAVE_DELAY);
      } else {
        isUpdatingState.current = false;
      }

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [resizable, isMaximized, dispatch, id, initialSize.width, initialSize.height]);

  // Handle window click to focus
  // const handleWindowClick = useCallback(() => {
  //   dispatch({ type: "FOCUS_WINDOW", payload: { id } });
  // }, [dispatch, id]);

  // Early return if window is minimized or doesn't exist
  if (isMinimized || !windowData) {
    return null;
  }

  const currentPosition = windowData.position || initialPosition;

  return (
    <Draggable
      handle=".window-title-bar"
      bounds="parent"
      position={isMaximized ? { x: 0, y: 0 } : currentPosition}
      onStart={handleDragStart}
      onStop={handleDragStop}
      nodeRef={windowRef as React.RefObject<HTMLElement>}
      disabled={isMaximized}
    >
      <div
        ref={windowRef}
        className={`${styles.window} ${isActive ? styles.active : ''} ${windowState.animationClass} ${className}`}
        style={{
          ...windowStyle,
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (!isActive) {
            dispatch({ type: 'FOCUS_WINDOW', payload: { id } });
            playSound('click');
          }
        }}
        data-window-id={id}
        data-window-active={isActive ? "true" : "false"}
        data-testid={`window-${id}`}
      >
        <div className={styles.windowContent}>
          <div
            className={`${styles.titleBar} window-title-bar`}
            onDoubleClick={handleTitleDoubleClick}
            data-testid="window-titlebar"
          >
            <div className={styles.title}>{title}</div>
            <div className={styles.controls}>
              <button
                onClick={(e) => { e.stopPropagation(); handleMinimize(); }}
                className={styles.control}
                type="button"
                data-window-control="minimize"
                aria-label="Minimize"
              >
                <ArrowsInLineVertical size={16} />
              </button>

              {resizable && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleMaximize(); }}
                  className={styles.control}
                  type="button"
                  data-window-control="maximize"
                  aria-label={isMaximized ? "Restore" : "Maximize"}
                >
                  <FrameCorners size={16} />
                </button>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                className={styles.control}
                type="button"
                data-window-control="close"
                aria-label="Close"
              >
                <XSquare size={16} />
              </button>
            </div>
          </div>

          <div className={styles.content}>{children}</div>

          {resizable && !isMaximized && (
            <div
              className={styles.resizeHandle}
              onMouseDown={handleResizeMouseDown}
              data-testid="window-resize-handle"
            />
          )}
        </div>
      </div>
    </Draggable>
  );
};

export default Window;