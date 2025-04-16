// src/components/windows/Window.tsx
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable'; // Import Draggable
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
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
  // WINDOW_CLASSES, // Can potentially remove if not used elsewhere
  // WINDOW_SOUNDS, // Sounds handled by useSounds
  WINDOW_ANIMATIONS,
  TIMING,
} from "@/utils/constants/windowConstants";
import { ensureWindowVisibility, getRestorePosition } from "@/utils/windowServices/WindowPositionService";
// import fixStyles from "../styles/WindowFix.module.scss"; // Review if this is still needed
import styles from "../styles/Window.module.scss";
import { useTouchSupport } from "@/hooks/useTouchSupport"; // Keep for non-drag gestures
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
  resizable = true, // Added resizable prop
  className = '',
}) => {
  const { state, dispatch } = useDesktop();
  const { playSound } = useSounds();
  const windowRef = useRef<HTMLDivElement>(null); // Ref for Draggable node
  const isMounted = useRef(true);
  const isUpdatingState = useRef(false); // Guard against rapid dispatches

  // Simplified state - Draggable handles drag position
  const [windowState, setWindowState] = useState<WindowState>({
    preMaximizedState: null,
    animationClass: ''
  });
  const windowData = useMemo(() => state.windows.find(w => w.id === id), [state.windows, id]);
  const isActive = state.activeWindowId === id;
  const isMinimized = windowData?.minimized || false;
  // Correct isMaximized check based on preMaximizedState
  const isMaximized = useMemo(() => !!windowState.preMaximizedState, [windowState.preMaximizedState]);

  // --- Draggable Handlers ---
  const debouncedStop = useMemo(
    () => debounce((_, data: DraggableData) => {
      console.log(`Drag stop for ${id} at`, data.x, data.y);
      const finalPosition = ensureWindowVisibility(
        { x: data.x, y: data.y },
        windowData?.size || initialSize
      );
      // Only dispatch if the position actually changed significantly after ensuring visibility
      if (Math.abs(finalPosition.x - data.x) > 1 || Math.abs(finalPosition.y - data.y) > 1) {
        dispatch({ type: 'UPDATE_WINDOW_POSITION', payload: { id, position: finalPosition } });
      } else if (windowData?.position && (Math.abs(windowData.position.x - data.x) > 1 || Math.abs(windowData.position.y - data.y) > 1)) {
        // Dispatch even if ensureWindowVisibility didn't change it, but it differs from state
        dispatch({ type: 'UPDATE_WINDOW_POSITION', payload: { id, position: { x: data.x, y: data.y } } });
      }

    }, TIMING.POSITION_UPDATE_DEBOUNCE),
    [dispatch, id, windowData?.size, initialSize, windowData?.position] // Added windowData.position dependency
  );

  const handleDragStart = useCallback(() => {
    if (!isActive && !isUpdatingState.current) {
      isUpdatingState.current = true;
      dispatch({ type: 'FOCUS_WINDOW', payload: { id } });
      playSound("windowFocus"); // Play focus sound on drag start if not active
      // Release guard quickly
      requestAnimationFrame(() => { isUpdatingState.current = false; });
    }
  }, [isActive, dispatch, id, playSound]);
  const handleClose = useCallback(() => {
    if (isUpdatingState.current) return;
    isUpdatingState.current = true;
    playSound("windowClose");
    // Add exit animation class if using CSS animations
    setWindowState(prev => ({ ...prev, animationClass: 'closing' })); // Example class
    setTimeout(() => {
      if (isMounted.current) {
        dispatch({ type: "CLOSE_WINDOW", payload: { id } });
      }
      // No need to clear guard here, component unmounts
    }, WINDOW_ANIMATIONS.CLOSE_DURATION); // Match animation time
  }, [dispatch, id, playSound]);


  const handleMinimize = useCallback(() => {
    if (isUpdatingState.current) return;
    isUpdatingState.current = true;
    setWindowState(prev => ({ ...prev, animationClass: 'minimizing' }));
    playSound("windowMinimize");
    setTimeout(() => {
      if (isMounted.current) {
        dispatch({ type: "MINIMIZE_WINDOW", payload: { id } });
        // Reset animation class if needed, though minimize hides it
        // setWindowState(prev => ({ ...prev, animationClass: '' }));
        isUpdatingState.current = false; // Release guard after dispatch
      }
    }, WINDOW_ANIMATIONS.MINIMIZE_DURATION + TIMING.ANIMATION_BUFFER);
  }, [dispatch, id, playSound]);


  const handleMaximize = useCallback(() => {
    if (!resizable || isUpdatingState.current) return; // Check resizable flag
    isUpdatingState.current = true;

    if (isMaximized) { // Restore
      setWindowState(prev => ({ ...prev, animationClass: 'restoring' }));
      playSound("windowOpen"); // Restore sound
      if (windowState.preMaximizedState) {
        const { position, size } = windowState.preMaximizedState;
        const validPosition = getRestorePosition(position, size);
        dispatch({ type: "UPDATE_WINDOW", payload: { id, position: validPosition, size } });
        // Clear preMaximizedState immediately after dispatching restore
        setWindowState(prev => ({ ...prev, preMaximizedState: null }));
      } else {
        // Fallback if preMaximizedState is somehow null
        dispatch({ type: "UPDATE_WINDOW", payload: { id, position: initialPosition, size: initialSize } });
        setWindowState(prev => ({ ...prev, preMaximizedState: null }));
      }
    } else { // Maximize
      setWindowState(prev => ({
        ...prev,
        animationClass: 'maximizing',
        preMaximizedState: {
          position: windowData?.position || initialPosition,
          size: windowData?.size || initialSize,
        }
      }));
      playSound("windowOpen"); // Maximize sound
      const maximizedSize = {
        width: window.innerWidth - 4, // Adjust for borders
        height: window.innerHeight - WINDOW_POSITIONS.TASKBAR_HEIGHT - 4, // Adjust for borders/taskbar
      };
      dispatch({ type: "UPDATE_WINDOW", payload: { id, position: { x: 0, y: 0 }, size: maximizedSize } });
    }

    // Clear animation class after animation
    setTimeout(() => {
      if (isMounted.current) {
        setWindowState(prev => ({ ...prev, animationClass: '' }));
        isUpdatingState.current = false; // Release guard
      }
    }, WINDOW_ANIMATIONS.MAXIMIZE_DURATION + TIMING.ANIMATION_BUFFER); // Use appropriate duration

  }, [
    resizable, isMaximized, windowState.preMaximizedState, windowData, id,
    initialPosition, initialSize, dispatch, playSound
  ]);

  // Double-click on title bar toggles maximize
  const handleTitleDoubleClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-window-control]") || !resizable) { // Check resizable
      return;
    }
    handleMaximize();
  }, [handleMaximize, resizable]); // Add resizable dependency
  // --- End Window Event Handlers ---


  // --- Styles and Classes ---
  const windowClasses = useMemo(() => {
    return [
      styles.window,
      isActive ? styles.active : "",
      isMaximized ? styles.maximized : "",
      windowState.animationClass ? styles[windowState.animationClass] : "",
      // Removed dragging/resizing classes - Draggable might add its own
      className, // Allow external classes
    ].filter(Boolean).join(" ");
  }, [isActive, isMaximized, windowState.animationClass, className]);

  const windowStyle = useMemo(() => {
    const size = windowData?.size || initialSize;
 // Use existing zIndex logic

    // Base styles - Position is handled by Draggable transform
    const style: React.CSSProperties = {
      width: isMaximized ? "calc(100vw - 4px)" : `${size.width}px`,
      height: isMaximized ? `calc(100vh - ${WINDOW_POSITIONS.TASKBAR_HEIGHT + 4}px)` : `${size.height}px`,
      zIndex: windowData?.zIndex || Z_INDEX.WINDOW_NORMAL,
      position: 'absolute',
      visibility: isMinimized ? 'hidden' : 'visible', // Still needed for minimize
      display: isMinimized ? 'none' : 'block', // Still needed for minimize
      pointerEvents: isMinimized ? 'none' : 'auto',
      overflow: 'hidden', // Prevent content overflow during resize/drag issues
      backfaceVisibility: 'hidden',
      // willChange: 'transform', // Let Draggable manage this if needed
    };
    // Apply minimum constraints directly
    if (!isMaximized) {
      style.minWidth = `${WINDOW_SIZE_CONSTRAINTS.MIN_WIDTH}px`;
      style.minHeight = `${WINDOW_SIZE_CONSTRAINTS.MIN_HEIGHT}px`;
    }

    return style;
  }, [isMinimized, isMaximized, windowData, initialSize,]);
  // --- End Styles and Classes ---

  // --- Resize Handle ---
  // Basic resize logic (can be replaced with react-resizable)
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    if (!resizable || isMaximized || isUpdatingState.current) return;
    e.preventDefault();
    e.stopPropagation();
    isUpdatingState.current = true; // Use guard

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
        // Debounced update to state
        // Use a separate debounce instance for resize
        const debouncedResizeStop = debounce(() => {
          if (isMounted.current) {
            dispatch({
              type: "UPDATE_WINDOW_SIZE",
              payload: { id, size: { width: finalWidth, height: finalHeight } }
            });
            isUpdatingState.current = false; // Release guard
          }
        }, TIMING.SAVE_DELAY); // Use a slightly longer delay after resize
        debouncedResizeStop();
      } else {
        isUpdatingState.current = false; // Release guard if ref is lost
      }

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [resizable, isMaximized, dispatch, id, initialSize.width, initialSize.height]);
  // --- End Resize Handle ---


  // --- Render ---
  const handleWindowClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // Prevent default behavior
    event.stopPropagation();
    // Dispatch action to focus the window
    dispatch({ type: "FOCUS_WINDOW", payload: { id } });
  }, [dispatch, id]);

  // Early return if minimized or window doesn't exist in state yet
  if (isMinimized || !windowData) {
    return null;
  }

  const currentPosition = windowData.position || initialPosition;


  return (
    <Draggable
      handle=".window-title-bar" // Class for drag handle
      bounds="parent" // Constrain to parent div (WindowManager)
      position={isMaximized ? { x: 0, y: 0 } : currentPosition}
      onStart={handleDragStart}
      // onDrag={throttledDrag} // Throttling might be needed if complex children cause lag
      onStop={debouncedStop} // Use debounced stop handler
      nodeRef={windowRef as React.RefObject<HTMLElement>} // Crucial for Draggable
      disabled={isMaximized} // Disable when maximized
    // grid={[1, 1]} // Optional: Snap to pixels
    >
      <div
        ref={windowRef} // Ref for Draggable and touch support
        className={windowClasses}
        style={windowStyle}
        onClick={handleWindowClick}
        data-window-id={id}
        data-window-active={isActive ? "true" : "false"}
        data-testid={`window-${id}`}
      >
        <div className={styles.windowContent}>
          <div
            className={`${styles.titleBar} window-title-bar`} // Ensure class matches handle
            onDoubleClick={handleTitleDoubleClick}
            data-testid="window-titlebar"
          // Removed onMouseDown - Draggable handles drag initiation
          >
            <div className={styles.title}>{title}</div>
            <div className={styles.controls}>
              <button
                onClick={(e) => { e.stopPropagation(); handleMinimize(); }}
                className={styles.control}
                type="button" data-window-control="minimize" aria-label="Minimize"
              ><ArrowsInLineVertical size={16} /></button>
              {resizable && // Only show maximize if resizable
                <button
                  onClick={(e) => { e.stopPropagation(); handleMaximize(); }}
                  className={styles.control}
                  type="button" data-window-control="maximize" aria-label={isMaximized ? "Restore" : "Maximize"}
                ><FrameCorners size={16} /></button>
              }
              <button
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                className={styles.control}
                type="button" data-window-control="close" aria-label="Close"
              ><XSquare size={16} /></button>
            </div>
          </div>
          <div className={styles.content}>{children}</div>
          {resizable && !isMaximized && (
            <div
              className={styles.resizeHandle}
              onMouseDown={handleResizeMouseDown} // Attach resize handler
              data-testid="window-resize-handle"
            />
          )}
        </div>
      </div>
    </Draggable>
  );
};

// Removed React.memo custom comparison for now, let Draggable manage updates
export default Window;

