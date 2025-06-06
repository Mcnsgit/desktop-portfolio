// src/components/windows/Window.tsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import {
  ArrowsInLineVertical,
  FrameCorners,
  XSquare,
} from "@phosphor-icons/react";
// import { useDesktop } from "../../context/DesktopContext"; // Removed
import { useSounds } from "@/hooks/useSounds";
import styles from "./Window.module.scss";

// --- Import New Model Classes ---
import { Desktop as DesktopModel } from "../../../src/model/Desktop";
import { WindowModel } from "../../../src/model/Window";


// Constants from your windowConstants (can be kept or moved)
const Z_INDEX = {
  WINDOW_NORMAL: 1000, // These might be dynamically handled by model or WindowManager sort
  WINDOW_FOCUSED: 1100
};

const WINDOW_POSITIONS = { // Default/fallback values
  BASE_OFFSET_X: 50,
  BASE_OFFSET_Y: 50,
  TASKBAR_HEIGHT: 30 // Used for maximizing calculations
};

const WINDOW_SIZE_CONSTRAINTS = { // Default/fallback values
  MIN_WIDTH: 200, // Reduced default min width
  MIN_HEIGHT: 150, // Reduced default min height
  DEFAULT_WIDTH: 500,
  DEFAULT_HEIGHT: 300
};

const WINDOW_ANIMATIONS = { // Can be kept for CSS class timings
  CLOSE_DURATION: 200,
  MINIMIZE_DURATION: 200,
  MAXIMIZE_DURATION: 200
};

// Types for local component state (if any remains beyond model)
interface LocalWindowState {
  preMaximizedState: { // To store position/size before maximizing
    position: { x: number; y: number };
    size: { width: number; height: number };
  } | null;
  animationClass: string; // For CSS animations
  isDraggingOrResizing: boolean;
}

// New Props for the refactored Window component
interface WindowComponentProps {
  model: WindowModel;
  desktopModel: DesktopModel;
  forceUpdate: () => void;
  children: React.ReactNode;
  className?: string;
  resizable?: boolean; // Could also be derived from model or content type
}

const WindowComponent: React.FC<WindowComponentProps> = ({
  model,
  desktopModel,
  forceUpdate,
  children,
  className = '',
  resizable = true, // Default to true
}) => {
  const { playSound } = useSounds();
  const windowRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true); // To prevent state updates on unmounted component

  // Local state for UI aspects not directly in WindowModel (like pre-maximize dimensions, animation classes)
  const [localState, setLocalState] = useState<LocalWindowState>({
    preMaximizedState: null,
    animationClass: '',
    isDraggingOrResizing: false,
  });

  // Derived states from the model
  const isActive = model.isFocused;
  const isMinimized = model.isMinimized; // model.isOpen will control rendering by WindowManager
  const isMaximized = model.isMaximized;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Effect to handle initial focus if this window is marked as focused in the model
  useEffect(() => {
    if (model.isFocused && windowRef.current) {
        // Potentially bring to front visually if not handled by map order in WindowManager
        // This is more about initial state from model.
    }
  }, [model.isFocused]);


  // Handle focus via model
  const handleFocus = useCallback(() => {
    if (!isActive) {
      desktopModel.windowManager.setFocus(model.id);
      playSound("click"); // Or a specific "windowFocus" sound
      forceUpdate();
    }
  }, [isActive, desktopModel, model.id, playSound, forceUpdate]);

  // Drag handlers
  const handleDragStart = useCallback(() => {
    setLocalState(prev => ({ ...prev, isDraggingOrResizing: true }));
    handleFocus(); // Ensure window is focused on drag start
  }, [handleFocus]);

  const handleDragStop = useCallback((_e: DraggableEvent, data: DraggableData) => {
    setLocalState(prev => ({ ...prev, isDraggingOrResizing: false }));
    const newPosition = {
      x: Math.max(0, data.x), // Basic boundary collision
      y: Math.max(0, data.y)
    };
    // Update the model's position
    model.position = newPosition;
    forceUpdate();
  }, [model, forceUpdate]);


  // Close window via model
  const handleClose = useCallback(() => {
    playSound("windowClose");
    setLocalState(prev => ({ ...prev, animationClass: styles.closing || 'closing' })); // Use styles.closing
    setTimeout(() => {
      if (isMounted.current) {
        desktopModel.windowManager.closeWindow(model.id);
        forceUpdate(); // Desktop will re-render WindowManager, which won't include this window
      }
    }, WINDOW_ANIMATIONS.CLOSE_DURATION);
  }, [desktopModel, model.id, playSound, forceUpdate]);

  // Minimize window via model
  const handleMinimize = useCallback(() => {
    playSound("click");
    setLocalState(prev => ({ ...prev, animationClass: styles.minimizing || 'minimizing' })); // Use styles.minimizing
    
    // Important: If maximizing, store current pos/size BEFORE minimizing.
    // This logic might need refinement if a maximized window is minimized.
    // For now, minimize action will take precedence.
     if (isMaximized && !localState.preMaximizedState) {
       // This case should ideally be handled by handleMaximize ensuring preMaximizedState is set
       // Or, the model itself should clear isMaximized on minimize.
       // For robustness, let's assume minimize should also clear local preMaximizedState if it exists
       // and reset the model's isMaximized flag if that's the desired behavior.
        if (model.isMaximized) model.toggleMaximize(); // Tell the model it's no longer maximized
        setLocalState(prev => ({ ...prev, preMaximizedState: null }));
    }

    setTimeout(() => {
      if (isMounted.current) {
        desktopModel.windowManager.minimizeWindow(model.id);
        forceUpdate();
        // Animation class should be cleared by Desktop/WindowManager not rendering this or by an effect if it becomes visible again
         setLocalState(prev => ({ ...prev, animationClass: '' })); 
      }
    }, WINDOW_ANIMATIONS.MINIMIZE_DURATION);
  }, [desktopModel, model, playSound, forceUpdate, isMaximized, localState.preMaximizedState]);

  // Toggle maximize/restore
  const handleMaximize = useCallback(() => {
    if (!resizable) return;
    playSound("click");

    if (isMaximized) { // Currently maximized, so restore
      if (localState.preMaximizedState) {
        model.position = localState.preMaximizedState.position;
        model.size = localState.preMaximizedState.size;
        setLocalState(prev => ({ ...prev, preMaximizedState: null, animationClass: styles.restoring || 'restoring' }));
      }
       model.toggleMaximize(); // Tell the model it's no longer maximized
    } else { // Not maximized, so maximize
      setLocalState(prev => ({
        ...prev,
        preMaximizedState: { position: { ...model.position }, size: { ...model.size } },
        animationClass: styles.maximizing || 'maximizing'
      }));
      // Calculate maximized position and size
      const taskbarHeight = WINDOW_POSITIONS.TASKBAR_HEIGHT; // Get from constants or props
      model.position = { x: 0, y: 0 };
      model.size = {
        width: window.innerWidth,
        height: window.innerHeight - taskbarHeight
      };
      model.toggleMaximize(); // Tell the model it's now maximized
    }
    
    setTimeout(() => {
        if(isMounted.current) {
            setLocalState(prev => ({ ...prev, animationClass: '' }));
            forceUpdate();
        }
    }, WINDOW_ANIMATIONS.MAXIMIZE_DURATION);

  }, [resizable, playSound, model, forceUpdate, isMaximized, localState.preMaximizedState]);


  // --- Resize Handlers ---
  const [resizeData, setResizeData] = useState<{
    active: boolean;
    handle: string;
    initialMouseX: number;
    initialMouseY: number;
    initialWidth: number;
    initialHeight: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const onResizeStart = useCallback((e: React.MouseEvent<HTMLDivElement>, handle: string) => {
    if (!resizable || isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    handleFocus(); // Focus window on resize start
    setLocalState(prev => ({ ...prev, isDraggingOrResizing: true }));
    setResizeData({
      active: true,
      handle,
      initialMouseX: e.clientX,
      initialMouseY: e.clientY,
      initialWidth: model.size.width,
      initialHeight: model.size.height,
      initialX: model.position.x,
      initialY: model.position.y,
    });
  }, [resizable, isMaximized, model.size, model.position, handleFocus]);

  const onResizeGlobalMove = useCallback((e: MouseEvent) => {
    if (!resizeData || !resizeData.active || !resizeData.handle) return;
    e.preventDefault();

    let newWidth = resizeData.initialWidth;
    let newHeight = resizeData.initialHeight;
    let newX = resizeData.initialX;
    let newY = resizeData.initialY;

    const dx = e.clientX - resizeData.initialMouseX;
    const dy = e.clientY - resizeData.initialMouseY;

    if (resizeData.handle.includes("right")) newWidth = resizeData.initialWidth + dx;
    if (resizeData.handle.includes("left")) {
      newWidth = resizeData.initialWidth - dx;
      newX = resizeData.initialX + dx;
    }
    if (resizeData.handle.includes("bottom")) newHeight = resizeData.initialHeight + dy;
    if (resizeData.handle.includes("top")) {
      newHeight = resizeData.initialHeight - dy;
      newY = resizeData.initialY + dy;
    }

    newWidth = Math.max(WINDOW_SIZE_CONSTRAINTS.MIN_WIDTH, newWidth);
    newHeight = Math.max(WINDOW_SIZE_CONSTRAINTS.MIN_HEIGHT, newHeight);
    
    // Update model directly during resize for smoother visual feedback potentially
    // Or only update on mouse up if preferred
    model.size = { width: newWidth, height: newHeight };
    model.position = { x: newX, y: newY };
    forceUpdate(); // This will make it feel responsive

  }, [resizeData, model, forceUpdate]);

  const onResizeGlobalUp = useCallback(() => {
    if (resizeData && resizeData.active) {
      // Final update to model is already done during move for responsiveness.
      // Here we just clear the resize state.
      setLocalState(prev => ({ ...prev, isDraggingOrResizing: false }));
      setResizeData(null);
      // forceUpdate(); // Ensure final state is rendered, though onResizeGlobalMove should handle it.
    }
  }, [resizeData]);

  useEffect(() => {
    if (resizeData?.active) {
      document.addEventListener("mousemove", onResizeGlobalMove);
      document.addEventListener("mouseup", onResizeGlobalUp);
      return () => {
        document.removeEventListener("mousemove", onResizeGlobalMove);
        document.removeEventListener("mouseup", onResizeGlobalUp);
      };
    }
  }, [resizeData, onResizeGlobalMove, onResizeGlobalUp]);

  // Draggable node ref for react-draggable (using windowRef)

  // Conditional class names
  const windowClasses = [
    styles.window,
    className,
    isActive ? styles.active : '',
    isMaximized ? styles.maximized : '',
    localState.animationClass, // For open/close/minimize animations
    localState.isDraggingOrResizing ? styles.draggingOrResizing : '',
  ].filter(Boolean).join(' ');

  // Inline styles for position and size, derived from model
  // Draggable controls position if not maximized
  const windowStyle: React.CSSProperties = isMaximized ? {
    left: 0,
    top: 0,
    width: '100%',
    height: `calc(100% - ${WINDOW_POSITIONS.TASKBAR_HEIGHT}px)`, // Full viewport minus taskbar
    transform: 'none', // Override draggable transform when maximized
    zIndex: isActive ? Z_INDEX.WINDOW_FOCUSED : Z_INDEX.WINDOW_NORMAL,
  } : {
    // Position and size will be handled by Draggable and resize logic,
    // but initial values from model are used by Draggable.
    // We ensure zIndex is set here too.
    width: model.size.width,
    height: model.size.height,
    zIndex: isActive ? Z_INDEX.WINDOW_FOCUSED : Z_INDEX.WINDOW_NORMAL,
    // Position is set by Draggable component via `position` or `defaultPosition` prop
  };
  
  if (isMinimized) { // Should not be rendered by WindowManager if minimized
      return null;
  }


  return (
    <Draggable
      nodeRef={windowRef as React.RefObject<HTMLElement>}
      handle=".${styles.titleBar}" // Class name for the draggable handle
      defaultPosition={{ x: model.position.x, y: model.position.y }} // Initial position from model
      position={isMaximized ? {x:0, y:0} : model.position} // Controlled position from model if not maximized
      onStart={handleDragStart}
      onStop={handleDragStop}
      disabled={isMaximized || localState.isDraggingOrResizing} // Disable drag when maximized or resizing
    >
      <div
        ref={windowRef} // Attach the ref here for Draggable
        id={model.id}
        className={windowClasses}
        style={windowStyle}
        onMouseDownCapture={handleFocus} // Capture phase to ensure focus happens before other clicks
        onClick={handleFocus} // Fallback focus, though mousedown is better
      >
        <div className={styles.titleBar}>
          <div className={styles.title}>{model.title}</div>
          <div className={styles.controls}>
            <button onClick={handleMinimize} className={styles.controlButton} aria-label="Minimize">
              <ArrowsInLineVertical size={16} weight="bold" />
            </button>
            {resizable && (
              <button onClick={handleMaximize} className={styles.controlButton} aria-label={isMaximized ? "Restore" : "Maximize"}>
                <FrameCorners size={16} weight="bold" />
              </button>
            )}
            <button onClick={handleClose} className={`${styles.controlButton} ${styles.closeButton}`} aria-label="Close">
              <XSquare size={16} weight="bold" />
            </button>
          </div>
        </div>
        <div className={styles.content}>
          {children}
          {resizable && !isMaximized && (
            <>
              <div className={`${styles.resizeHandle} ${styles.topLeft}`} onMouseDown={(e) => onResizeStart(e, 'top-left')}></div>
              <div className={`${styles.resizeHandle} ${styles.top}`} onMouseDown={(e) => onResizeStart(e, 'top')}></div>
              <div className={`${styles.resizeHandle} ${styles.topRight}`} onMouseDown={(e) => onResizeStart(e, 'top-right')}></div>
              <div className={`${styles.resizeHandle} ${styles.left}`} onMouseDown={(e) => onResizeStart(e, 'left')}></div>
              <div className={`${styles.resizeHandle} ${styles.right}`} onMouseDown={(e) => onResizeStart(e, 'right')}></div>
              <div className={`${styles.resizeHandle} ${styles.bottomLeft}`} onMouseDown={(e) => onResizeStart(e, 'bottom-left')}></div>
              <div className={`${styles.resizeHandle} ${styles.bottom}`} onMouseDown={(e) => onResizeStart(e, 'bottom')}></div>
              <div className={`${styles.resizeHandle} ${styles.bottomRight}`} onMouseDown={(e) => onResizeStart(e, 'bottom-right')}></div>
            </>
          )}
        </div>
      </div>
    </Draggable>
  );
};

export default WindowComponent;