// src/components/windows/Window.tsx
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowsInLineVertical,
  FrameCorners,
  XSquare,
} from "@phosphor-icons/react";
import { useDesktop } from "../../context/DesktopContext";
import { useSounds } from "@/hooks/useSounds";
import {
  Z_INDEX,
  WINDOW_SIZE_CONSTRAINTS,
  WINDOW_POSITIONS,
  WINDOW_CLASSES,
  WINDOW_SOUNDS,
  TIMING,
} from "@/utils/constants/windowConstants";
import {ensureWindowVisibility,getRestorePosition,} from "@/utils/windowServices/WindowPositionService";

import styles from "../styles/Window.module.scss";
import { WINDOW_ANIMATIONS } from "@/utils/constants/windowConstants";

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
  isDragging: boolean;
  isResizing: boolean;
  animationClass: string;
}
interface Window {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minimized: boolean;
  type: string;
  content: React.ReactNode;
  zIndex: number; // Ensure zIndex is defined for all windows
}
// Component
const Window: React.FC<WindowProps> = ({
  id,
  title,
  children,
  initialPosition = { x: WINDOW_POSITIONS.BASE_OFFSET_X, y: WINDOW_POSITIONS.BASE_OFFSET_Y },
  initialSize = { width: WINDOW_SIZE_CONSTRAINTS.DEFAULT_WIDTH, height: WINDOW_SIZE_CONSTRAINTS.DEFAULT_HEIGHT },
  resizable = true,
  className = '',
}) => {
  // Hooks
  const { state, dispatch } = useDesktop();
  const { playSound } = useSounds();

  // Refs
  const windowRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const isUpdatingPosition = useRef(false);
  const isUpdatingState = useRef(false);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);

  // State
  const [windowState, setWindowState] = useState<WindowState>({
    preMaximizedState: null,
    isDragging: false,
    isResizing: false,
    animationClass: ''
  });

  // Memoized values 
  const windowData = useMemo(() => {
    return state.windows.find(w => w.id === id);
  }, [state.windows, id]);

  const isActive = state.activeWindowId === id;
  const isMinimized = windowData?.minimized || false;
  const isMaximized = useMemo(() => !!windowState.preMaximizedState, [windowState.preMaximizedState]);

  // Z-index calculation
  const calculateZIndex = useCallback(() => {
    if (isActive) {
      return Z_INDEX.WINDOW_ACTIVE;
    } else if (isMinimized) {
      return Z_INDEX.WINDOW_MINIMIZED;
    } else {
      const windowIndex = state.windows.findIndex((w) => w.id === id);
      return Z_INDEX.WINDOW_NORMAL + windowIndex;
    }
  }, [isActive, isMinimized, id, state.windows]);

  // Window styles
  const windowStyle = useMemo(() => {
    const position = windowData?.position || initialPosition;
    const size = windowData?.size || initialSize;

    // Ensure valid position (not below taskbar)
    const validPosition = isMaximized
      ? { x: 0, y: 0 }
      : ensureWindowVisibility(position, size);

    // Use stored zIndex if available, otherwise calculate it
    const zIndex = windowData?.zIndex || calculateZIndex();

    return {
      width: isMaximized ? "calc(100vw - 4px)" : size.width,
      height: isMaximized ? `calc(100vh - ${WINDOW_POSITIONS.TASKBAR_HEIGHT + 14}px)` : size.height,
      zIndex,
      position: "absolute" as const,
      top: validPosition.y,
      left: validPosition.x,
      visibility: isMinimized ? "hidden" : "visible",
      display: isMinimized ? "none" : "block",
      pointerEvents: isMinimized ? "none" as const : "auto" as const,
    };
  }, [
    isMinimized,
    isMaximized,
    calculateZIndex,
    windowData,
    initialPosition,
    initialSize,
  ]);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
        updateTimeout.current = null;
      }
    };
  }, []);

  // Event handlers
  const handleWindowClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActive && !isUpdatingState.current) {
      isUpdatingState.current = true;
      dispatch({ type: "FOCUS_WINDOW", payload: { id } });
      playSound(WINDOW_SOUNDS.FOCUS);
      setTimeout(() => {
        isUpdatingState.current = false;
      }, 0);
    }
  }, [isActive, dispatch, id, playSound]);

  const handleClose = useCallback(() => {
    if (!isUpdatingState.current) {
      isUpdatingState.current = true;
      playSound(WINDOW_SOUNDS.CLOSE);
      dispatch({ type: "CLOSE_WINDOW", payload: { id } });
      setTimeout(() => {
        isUpdatingState.current = false;
      }, 0);
    }
  }, [dispatch, id, playSound]);

  const handleMinimize = useCallback(() => {
    if (!isUpdatingState.current) {
      isUpdatingState.current = true;
      setWindowState(prev => ({
        ...prev,
        animationClass: 'minimizing'
      }));

      playSound(WINDOW_SOUNDS.MINIMIZE);

      // Delay the actual minimize action for animation to complete
      setTimeout(() => {
        if (isMounted.current) {
          dispatch({ type: "MINIMIZE_WINDOW", payload: { id } });
          setWindowState(prev => ({
            ...prev,
            animationClass: ''
          }));
          isUpdatingState.current = false;
        }
      }, TIMING.ANIMATION_BUFFER);
    }
  }, [dispatch, id, playSound]);

  const handleMaximize = useCallback(() => {
    if (isUpdatingState.current) return;
    isUpdatingState.current = true;

    if (isMaximized) {
      // Restore to pre-maximize state
      // Batch state updates to reduce renders
      setWindowState(prev => ({
        ...prev,
        animationClass: 'restoring',
        preMaximizedState: null
      }));

      // Use stored values to restore the window
      if (windowState.preMaximizedState) {
        const { position, size } = windowState.preMaximizedState;
        const validPosition = getRestorePosition(position, size);

        // Batch these updates if possible using a custom action
        dispatch({
          type: "UPDATE_WINDOW",
          payload: {
            id,
            position: validPosition,
            size
          }
        });
      }
      playSound(WINDOW_SOUNDS.RESTORE);
    } else {
      // Save current state before maximizing
      setWindowState(prev => ({
        ...prev,
        animationClass: 'maximizing',
        preMaximizedState: {
          position: windowData?.position || initialPosition,
          size: windowData?.size || initialSize,
        }
      }));

      // Get viewport dimensions for maximized state
      const maximizedSize = {
        width: window.innerWidth - 4,
        height: window.innerHeight - WINDOW_POSITIONS.TASKBAR_HEIGHT - 14,
      };

      // Batch these updates if possible using a custom action
      dispatch({
        type: "UPDATE_WINDOW",
        payload: {
          id,
          position: { x: 0, y: 0 },
          size: maximizedSize
        }
      });

      playSound(WINDOW_SOUNDS.MAXIMIZE);
    }

    // Clear animation class after animation completes
    setTimeout(() => {
      if (isMounted.current) {
        setWindowState(prev => ({
          ...prev,
          animationClass: ''
        }));
        isUpdatingState.current = false;
      }
    }, TIMING.ANIMATION_BUFFER + WINDOW_ANIMATIONS.MAXIMIZE_DURATION);
  }, [
    isMaximized,
    windowState.preMaximizedState,
    windowData,
    id,
    initialPosition,
    initialSize,
    dispatch,
    playSound
  ]);

  
  // Handle dragging
  const handleTitleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't initiate drag on control buttons or when maximized
    if ((e.target as HTMLElement).closest("[data-window-control]") || isMaximized) {
      return;
    }

    e.preventDefault();
    setWindowState(prev => ({ ...prev, isDragging: true }));

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = windowRef.current?.offsetLeft || 0;
    const startTop = windowRef.current?.offsetTop || 0;

    // Focus window if it's not already active
    if (!isActive && !isUpdatingState.current) {
      isUpdatingState.current = true;
      dispatch({ type: "FOCUS_WINDOW", payload: { id } });
      setTimeout(() => {
        isUpdatingState.current = false;
      }, 0);
    }

    // Set up event handlers for drag
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!windowState.isDragging || !windowRef.current) return;

      const newLeft = Math.max(0, startLeft + (moveEvent.clientX - startX));
      const newTop = Math.max(
        WINDOW_POSITIONS.BASE_OFFSET_Y / 2,
        startTop + (moveEvent.clientY - startY)
      );

      // Apply new position directly to DOM for smooth dragging
      windowRef.current.style.left = `${newLeft}px`;
      windowRef.current.style.top = `${newTop}px`;
    };

    const handleMouseUp = () => {
      setWindowState(prev => ({ ...prev, isDragging: false }));

      // Update position in state when drag completes with debounce
      if (windowRef.current && !isUpdatingPosition.current) {
        isUpdatingPosition.current = true;

        // Clear any existing timeout
        if (updateTimeout.current) {
          clearTimeout(updateTimeout.current);
        }

        // Delay the update to prevent too frequent state changes
        updateTimeout.current = setTimeout(() => {
          if (windowRef.current && isMounted.current) {
            const rect = windowRef.current.getBoundingClientRect();
            const newPosition = { x: rect.left, y: rect.top };

            // Make sure the window isn't positioned below the taskbar
            const adjustedPosition = ensureWindowVisibility(
              newPosition,
              windowData?.size || initialSize
            );

            dispatch({
              type: "UPDATE_WINDOW_POSITION",
              payload: {
                id,
                position: adjustedPosition,
              },
            });
          }
          isUpdatingPosition.current = false;
          updateTimeout.current = null;
        }, TIMING.POSITION_UPDATE_DEBOUNCE);
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [
    isMaximized,
    isActive,
    dispatch,
    id,
    windowState.isDragging,
    windowData?.size,
    initialSize
  ]);

  // Handle resize
  const handleResize = useCallback((e: React.MouseEvent) => {
    // Don't allow resizing when maximized
    if (isMaximized) return;

    e.preventDefault();
    e.stopPropagation();
    setWindowState(prev => ({ ...prev, isResizing: true }));

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        const newWidth = Math.max(
          WINDOW_SIZE_CONSTRAINTS.MIN_WIDTH,
          moveEvent.clientX - rect.left
        );
        const newHeight = Math.max(
          WINDOW_SIZE_CONSTRAINTS.MIN_HEIGHT,
          moveEvent.clientY - rect.top
        );

        // Update DOM directly for smooth resizing
        windowRef.current.style.width = `${newWidth}px`;
        windowRef.current.style.height = `${newHeight}px`;
      }
    };

    const onMouseUp = () => {
      setWindowState(prev => ({ ...prev, isResizing: false }));

      // Update size in state when resize completes
      if (windowRef.current && !isUpdatingState.current) {
        isUpdatingState.current = true;
        const rect = windowRef.current.getBoundingClientRect();

        // Clear any existing timeout
        if (updateTimeout.current) {
          clearTimeout(updateTimeout.current);
        }

        // Delay the update to prevent too frequent state changes
        updateTimeout.current = setTimeout(() => {
          if (isMounted.current) {
            dispatch({
              type: "UPDATE_WINDOW_SIZE",
              payload: {
                id,
                size: { width: rect.width, height: rect.height },
              },
            });
            isUpdatingState.current = false;
          }
          updateTimeout.current = null;
        }, TIMING.POSITION_UPDATE_DEBOUNCE);
      }

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [isMaximized, dispatch, id]);

  // Double-click on title bar toggles maximize
  const handleTitleDoubleClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger maximize if clicking controls
    if ((e.target as HTMLElement).closest("[data-window-control]")) {
      return;
    }
    handleMaximize();
  }, [handleMaximize]);

  // Ensure windows are visible
  useEffect(() => {
    // Ensure window is visible when it first renders or becomes non-minimized
    if (windowRef.current && !isMinimized && !isMaximized && windowData) {
      // Get current position and size
      const size = windowData.size || initialSize;
      const position = windowData.position || initialPosition;

      // Check if window extends below viewport minus taskbar
      const adjustedPosition = ensureWindowVisibility(position, size);

      // Only update if position has changed significantly
      if (
        Math.abs(adjustedPosition.x - position.x) > 5 ||
        Math.abs(adjustedPosition.y - position.y) > 5
      ) {
        if (!isUpdatingPosition.current) {
          isUpdatingPosition.current = true;

          dispatch({
            type: "UPDATE_WINDOW_POSITION",
            payload: {
              id,
              position: adjustedPosition,
            },
          });

          setTimeout(() => {
            isUpdatingPosition.current = false;
          }, 0);
        }
      }
    }
  }, [
    isMinimized,
    isMaximized,
    windowData,
    id,
    dispatch,
    initialPosition,
    initialSize
  ]);

  // Early return if minimized or window doesn't exist in state
  if (isMinimized || !windowData) {
    return null;
  }

  // Compose CSS classes
  const windowClasses = [
    styles.window,
    isActive ? styles.active : "",
    isMaximized ? styles.maximized : "",
    windowState.animationClass ? styles[windowState.animationClass] : "",
    windowState.isDragging ? styles.dragging : "",
    windowState.isResizing ? styles.resizing : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div
      ref={windowRef}
      className={windowClasses}
      style={windowStyle}
      onClick={handleWindowClick}
      data-window-id={id}
      data-window-minimized={isMinimized ? "true" : "false"}
      data-window-active={isActive ? "true" : "false"}
      data-window-maximized={isMaximized ? "true" : "false"}
      data-testid={`window-${id}`}
    >
      <div className={styles.windowContent}>
        <div
          className={`${styles.titleBar} window-title-bar`}
          onMouseDown={handleTitleMouseDown}
          onDoubleClick={handleTitleDoubleClick}
          data-testid="window-titlebar"
        >
          <div className={styles.title}>{title}</div>
          <div className={styles.controls}>
            <button
              onClick={handleMinimize}
              className={styles.control}
              type="button"
              data-window-control="minimize"
              data-testid="window-minimize"
            >
              <ArrowsInLineVertical size={16} />
            </button>
            <button
              onClick={handleMaximize}
              className={styles.control}
              type="button"
              data-window-control="maximize"
              data-testid="window-maximize"
            >
              <FrameCorners size={16} />
            </button>
            <button
              onClick={handleClose}
              className={styles.control}
              type="button"
              data-window-control="close"
              data-testid="window-close"
            >
              <XSquare size={16} />
            </button>
          </div>
        </div>
        <div className={styles.content}>{children}</div>
        {resizable && !isMaximized && (
          <div
            className={styles.resizeHandle}
            onMouseDown={handleResize}
            data-testid="window-resize-handle"
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(Window, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary renders
  // Return true if the window shouldn't re-render
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.initialPosition?.x === nextProps.initialPosition?.x &&
    prevProps.initialPosition?.y === nextProps.initialPosition?.y &&
    prevProps.initialSize?.width === nextProps.initialSize?.width &&
    prevProps.initialSize?.height === nextProps.initialSize?.height &&
    prevProps.resizable === nextProps.resizable &&
    prevProps.className === nextProps.className
  );
});