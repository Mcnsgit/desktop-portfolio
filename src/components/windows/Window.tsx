// components/windows/Window.tsx - Fixed for Swapy integration
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  ArrowsInLineVertical,
  FrameCorners,
  XSquare,
} from "@phosphor-icons/react";
import { useDesktop } from "../../context/DesktopContext";
import styles from "../styles/Window.module.scss";

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
  const windowData = state.windows.find((w) => w.id === id);
  const isMinimized = windowData?.minimized || false;

  // Calculate appropriate z-index based on window state
  const calculateZIndex = useCallback(() => {
    if (isActive) {
      return 1000; // Active window always on top
    } else if (isMinimized) {
      return 1; // Minimized windows have lowest z-index
    } else {
      // Base z-index for non-active windows
      const windowIndex = state.windows.findIndex((w) => w.id === id);
      return 100 + windowIndex;
    }
  }, [isActive, isMinimized, id, state.windows]);

  const getWindowStyle = useCallback(() => {
    const position = windowData?.position || initialPosition;

    return {
      width: size.width,
      height: size.height,
      zIndex: calculateZIndex(),
      position: "absolute",
      top: position.y,
      left: position.x,
      // Add these properties for debugging
      visibility: isMinimized ? "hidden" : "visible",
      display: isMinimized ? "none" : "block",
      // Add these properties to help with pointer events
      pointerEvents: isMinimized
        ? "none"
        : ("auto" as React.CSSProperties["pointerEvents"]),
      // Add border for debugging
      border: isActive ? "2px solid blue" : "1px solid gray",
    } as React.CSSProperties;
  }, [
    isMinimized,
    isActive,
    calculateZIndex,
    windowData,
    initialPosition,
    size,
  ]);

  // Add this debugging useEffect to log window state changes
  useEffect(() => {
    console.log(`Window ${id} state changed:`, {
      isMinimized,
      isActive,
      zIndex: calculateZIndex(),
      windowExists: !!windowData,
    });
  }, [id, isMinimized, isActive, calculateZIndex, windowData]);

  if (isMinimized || !windowData) {
    console.log(
      `Window ${id} is minimized or not in state, minimized:`,
      isMinimized,
      "windowData:",
      !!windowData
    );
    return null;
  }

  // Avoid separate effect for Swapy initialization - window uses drag handlers directly

  // Handle window focus on click
  const handleWindowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActive) {
      dispatch({ type: "FOCUS_WINDOW", payload: { id } });
    }
  };

  // Window controls
  const handleClose = () => {
    console.log(`Closing window ${id}`);
    dispatch({ type: "CLOSE_WINDOW", payload: { id } });
  };

  const handleMinimize = () => {
    console.log(`Minimizing window ${id}`);
    dispatch({ type: "MINIMIZE_WINDOW", payload: { id } });
  };

  const handleMaximize = () => {
    if (typeof window !== "undefined") {
      if (size.width === window.innerWidth - 20) {
        // Restore to original size
        setSize(initialSize);

        // Update size in state
        dispatch({
          type: "UPDATE_WINDOW_SIZE",
          payload: {
            id,
            size: initialSize,
          },
        });
      } else {
        // Maximize
        const maximizedSize = {
          width: window.innerWidth - 20,
          height: window.innerHeight - 80,
        };

        setSize(maximizedSize);

        // Update size in state
        dispatch({
          type: "UPDATE_WINDOW_SIZE",
          payload: {
            id,
            size: maximizedSize,
          },
        });
      }
    }
  };

  // Handle dragging manually instead of using Swapy
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    // Don't initiate drag on control buttons
    if ((e.target as HTMLElement).closest("[data-swapy-no-drag]")) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = windowRef.current?.offsetLeft || 0;
    const startTop = windowRef.current?.offsetTop || 0;

    // Focus window if it's not already active
    if (!isActive) {
      dispatch({ type: "FOCUS_WINDOW", payload: { id } });
    }

    // Set up event handlers for drag
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging) return;

      const newLeft = startLeft + (moveEvent.clientX - startX);
      const newTop = startTop + (moveEvent.clientY - startY);

      if (windowRef.current) {
        windowRef.current.style.left = `${newLeft}px`;
        windowRef.current.style.top = `${newTop}px`;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);

      // Update position in state when drag completes
      if (windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();

        dispatch({
          type: "UPDATE_WINDOW_POSITION",
          payload: {
            id,
            position: { x: rect.left, y: rect.top },
          },
        });
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle resize functionality
  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

      // Update size in state when resize completes
      if (windowRef.current) {
        dispatch({
          type: "UPDATE_WINDOW_SIZE",
          payload: {
            id,
            size,
          },
        });
      }

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={windowRef}
      className={`${styles.window} ${isActive ? styles.active : ""} ${
        isMinimized ? styles.minimized : ""
      }`}
      style={getWindowStyle()}
      onClick={handleWindowClick}
      data-window-id={id}
      data-window-minimized={isMinimized ? "true" : "false"}
      data-window-active={isActive ? "true" : "false"}
    >
      <div className={styles.windowContent}>
        <div
          className={`${styles.titleBar} window-title-bar`}
          onMouseDown={handleTitleMouseDown}
        >
          <div className={styles.title}>{title}</div>
          <div className={styles.controls}>
            <button
              onClick={handleMinimize}
              className={styles.control}
              type="button"
              data-swapy-no-drag
            >
              <ArrowsInLineVertical size={16} />
            </button>
            <button
              onClick={handleMaximize}
              className={styles.control}
              type="button"
              data-swapy-no-drag
            >
              <FrameCorners size={16} />
            </button>
            <button
              onClick={handleClose}
              className={styles.control}
              type="button"
              data-swapy-no-drag
            >
              <XSquare size={16} />
            </button>
          </div>
        </div>
        <div className={styles.content}>{children}</div>
        {resizable && (
          <div
            className={styles.resizeHandle}
            onMouseDown={handleResize}
            data-swapy-no-drag
          />
        )}
      </div>
    </div>
  );
};

export default Window;
