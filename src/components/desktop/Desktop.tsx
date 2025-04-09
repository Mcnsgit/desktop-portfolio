// components/desktop/Desktop.tsx - With Swapy fixed implementation
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { createSwapy, Swapy } from "swapy";
import { useDesktop } from "../../context/DesktopContext";
import Icon from "./Icon";
import Folder from "./Folder";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import WindowManager from "../windows/WindowManager";
import RightClickMenu from "./rigthClickMenu";
import { useSounds } from "../../hooks/useSounds";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import styles from "../styles/Desktop.module.scss";
import { BackgroundImages } from "../../../public/backgrounds/BackgroundImages";
import { v4 as uuidv4 } from "uuid";
import { context } from "@react-three/fiber";

// Debug function to check window state
interface WindowState {
  id: string;
  title: string;
  minimized: boolean;
  position: { x: number; y: number };
  type: string;
}

const debugWindowState = (windowsState: WindowState[], activeWindowId: string | null): void => {
  console.log("Current window state:", {
    totalWindows: windowsState.length,
    openWindows: windowsState.filter((w) => !w.minimized).length,
    minimizedWindows: windowsState.filter((w) => w.minimized).length,
    activeWindow:
      windowsState.find((w) => w.id === activeWindowId)?.id || "none",
    windowDetails: windowsState.map((w) => ({
      id: w.id,
      title: w.title,
      minimized: w.minimized,
      position: w.position,
      type: w.type,
    })),
  });
};

const Desktop: React.FC = function Desktop() {
  const { state, dispatch } = useDesktop();
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const { playSound } = useSounds();
  const desktopRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<Swapy | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
  }>({
    visible: false,
    position: { x: 0, y: 0 },
  });
  // Track which desktop item is being dragged
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  useKeyboardShortcuts();

  const backgrounds = useMemo(
    () => [
      BackgroundImages?.retro_background_1 || "/backgrounds/bg1.jpg",
      BackgroundImages?.retro_background_2 || "/backgrounds/bg2.jpg",
      BackgroundImages?.retro_background_3 || "/backgrounds/bg3.jpg",
    ],
    []
  );
  useEffect(() => {
    // Debug window state whenever it changes
    debugWindowState(
      state.windows.map((window) => ({
        ...window,
        type: window.type || "unknown", // Ensure type is always a string
      })),
      state.activeWindowId
    );

    // Force rerender WindowManager if windows exist but aren't showing
    if (state.windows.length > 0) {
      // Check if window DOM elements exist
      setTimeout(() => {
        const windowElements = document.querySelectorAll('[data-window-id]');
        console.log(`Found ${windowElements.length} window DOM elements for ${state.windows.length} windows in state`);

        if (windowElements.length < state.windows.filter(w => !w.minimized).length) {
          console.log("Missing window elements - forcing update");
          // Force a small position change to trigger rerender
          state.windows.forEach(window => {
            if (!window.minimized) {
              dispatch({
                type: "UPDATE_WINDOW_POSITION",
                payload: {
                  id: window.id,
                  position: {
                    x: window.position.x + 1,
                    y: window.position.y
                  }
                }
              });
            }
          });
        }
      }, 500);
    }
  }, [state.windows, dispatch, state.activeWindowId]);

  // Initialize Swapy for desktop icons - FIXED
  useEffect(() => {
    if (desktopRef.current) {
      if (swapyRef.current) {
        swapyRef.current.destroy();
      }

      // Wait a bit to let React render the icons first
      setTimeout(() => {
        try {
          // Create new Swapy instance for desktop icons with React integration
          if (desktopRef.current) {
            swapyRef.current = createSwapy(desktopRef.current as HTMLElement, {
              swapMode: "drop",
              animation: "dynamic",
              dragAxis: "both",
              autoScrollOnDrag: true,
              manualSwap: true, // Required for React integration
            });

            console.log("Swapy initialized successfully");

            // Handle position updates when icons are moved
            swapyRef.current.onSwap((event) => {
              console.log("Icon swap event:", event);

              if (event && event.toSlot && event.fromSlot) {
                try {
                  const fromSlot = event.fromSlot as unknown as HTMLElement;
                  const toSlot = event.toSlot as unknown as HTMLElement;

                  const fromId = fromSlot
                    .getAttribute("data-swapy-slot")
                    ?.replace("slot-", "");
                  const toId = toSlot
                    .getAttribute("data-swapy-slot")
                    ?.replace("slot-", "");

                  if (fromId && toId) {
                    console.log(`Swapped icons: ${fromId} -> ${toId}`);

                    // Get positions for both slots
                    const fromRect = fromSlot.getBoundingClientRect();
                    const toRect = toSlot.getBoundingClientRect();

                    // Update positions in state
                    dispatch({
                      type: "UPDATE_ITEM_POSITION",
                      payload: {
                        itemId: fromId,
                        position: { x: toRect.left, y: toRect.top },
                      },
                    });

                    dispatch({
                      type: "UPDATE_ITEM_POSITION",
                      payload: {
                        itemId: toId,
                        position: { x: fromRect.left, y: fromRect.top },
                      },
                    });
                  }
                } catch (error) {
                  console.error("Error during icon swap:", error);
                }
              }
            });
          }
        } catch (error) {
          console.error("Error initializing Swapy:", error);
        }
      }, 100);
    }

    return () => {
      if (swapyRef.current) {
        swapyRef.current.destroy();
        swapyRef.current = null;
      }
    };
  }, [dispatch]);

  // Update Swapy when desktop items change
  const desktopItemsPositionKey = useMemo(() => {
    return state.desktopItems
      .map((item) => `${item.id}-${item.position.x}-${item.position.y}`)
      .join(",");
  }, [state.desktopItems]);

  // Update Swapy after React renders
  useEffect(() => {
    if (swapyRef.current) {
      // Delay the update to ensure React has finished rendering
      const timer = setTimeout(() => {
        try {
          if (swapyRef.current) {
            swapyRef.current.update();
            console.log("SWAPY updated after position changes");
          }
        } catch (error) {
          console.error("Error updating Swapy:", error);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [desktopItemsPositionKey]);

  // Then, update the handleIconDoubleClick function to include these additional logs:
  const handleIconDoubleClick = useCallback(
    (projectId: string) => {
      console.log(`Double-clicked on project icon: ${projectId}`);
      const project = state.projects.find((p) => p.id === projectId);

      if (project) {
        console.log(`Found project, opening window for: ${project.title}`);
        playSound("windowOpen");

        const windowPayload = {
          id: `project-${project.id}`,
          title: project.title,
          content: { type: "project", projectId: project.id },
          minimized: false,
          position: { x: 100, y: 100 },
          size: { width: 800, height: 600 }, // Default size for the window
          zIndex: 1, // Default zIndex for the window
          type: "project" as const, // Ensure type matches the allowed string literals
        };

        console.log("Dispatching OPEN_WINDOW with payload:", windowPayload);

        dispatch({
          type: "OPEN_WINDOW",
          payload: windowPayload,
        });

        // Force focus after a slight delay
        setTimeout(() => {
          console.log(`Forcing focus on new window: project-${project.id}`);
          dispatch({
            type: "FOCUS_WINDOW",
            payload: { id: `project-${project.id}` }
          });
        }, 100);
      } else {
        console.error(`Project not found with id: ${projectId}`);
      }
    },
    [dispatch, playSound, state.projects]
  );

  const handleDesktopClick = useCallback(() => {
    if (state.startMenuOpen) {
      dispatch({
        type: "TOGGLE_START_MENU",
        payload: { startMenuOpen: false },
      });
    }
    if (contextMenu.visible) {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  }, [state.startMenuOpen, contextMenu.visible, dispatch]);

  const cycleBackground = useCallback(() => {
    setBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
    playSound("click");
  }, [backgrounds.length, playSound]);

  // Toggle start menu
  const handleStartClick = useCallback(() => {
    console.log("Start menu toggle - current state:", state.startMenuOpen);
    dispatch({ type: "TOGGLE_START_MENU" });
  }, [dispatch, state.startMenuOpen]);

  // Handle drag start for making other operations aware of dragged item
  const handleDragStart = useCallback((e: React.DragEvent, itemId?: string) => {
    if (itemId) {
      setDraggedItemId(itemId);
      console.log(`Drag started for item: ${itemId}`);
    }
  }, []);

  // Handle right-click context menu
  const handleRightClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      playSound("click");
      setContextMenu({
        visible: true,
        position: { x: e.clientX, y: e.clientY },
      });
    },
    [playSound]
  );

  const contextMenuItems = useMemo(
    () => [
      {
        label: "Change Background",
        action: cycleBackground,
      },
      {
        label: "New Folder",
        action: () => {
          const folderId = uuidv4();
          dispatch({
            type: "CREATE_FOLDER",
            payload: {
              id: folderId,
              title: "New Folder",
              icon: "/assets/win98-icons/png/directory_closed-0.png",
              items: [],
              position: {
                x: Math.max(50, contextMenu.position.x - 40),
                y: Math.max(50, contextMenu.position.y - 40),
              },
            },
          });
          setContextMenu((prev) => ({ ...prev, visible: false }));
        },
      },
      {
        label: "Refresh",
        action: () => window.location.reload(),
      },
    ],
    [cycleBackground, contextMenu.position, dispatch]
  );

  const desktopItems = useMemo(() => {
    return state.desktopItems.filter((item) => !item.parentId);
  }, [state.desktopItems]);

  const desktopProjects = useMemo(() => {
    return desktopItems
      .filter((item) => item.type === "project" && item.id !== "about")
      .map((item) => {
        const project = state.projects.find((p) => p.id === item.id);
        return { ...item, project };
      })
      .filter((item) => item.project);
  }, [desktopItems, state.projects]);

  const renderStartMenu = useCallback(() => {
    return state.startMenuOpen ? <StartMenu /> : null;
  }, [state.startMenuOpen]);

  return (
    <div
      ref={desktopRef}
      className={styles.desktop}
      style={{
        backgroundImage: `url(${backgrounds[backgroundIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={handleDesktopClick}
      onContextMenu={handleRightClick}
    >
      {/* Desktop icons with proper slot and item matching */}
      <div className={styles.iconsContainer}>
        {desktopProjects.map((item) => (
          <div
            key={`slot-${item.id}`}
            data-swapy-slot={`slot-${item.id}`}
            style={{
              position: "absolute",
              left: item.position.x,
              top: item.position.y,
              width: "80px",
              height: "90px",
            }}
          >
            <div data-swapy-item={`slot-${item.id}`} style={{ height: "100%" }}>
              <Icon
                itemId={item.id}
                icon={
                  item.project?.icon ||
                  "/assets/win98-icons/png/notepad_file-0.png"
                }
                label={item.project?.title || "Unknown"}
                onDoubleClick={() => handleIconDoubleClick(item.id)}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, item.id)}
                position={{ x: 0, y: 0 }} // Position is now on the container div
              />
            </div>
          </div>
        ))}
      </div>

      <WindowManager />
      {renderStartMenu()}
      {contextMenu.visible && (
        <RightClickMenu
          position={contextMenu.position}
          items={contextMenuItems}
          onClose={() =>
            setContextMenu((prev) => ({ ...prev, visible: false }))
          }
        />
      )}
      <Taskbar onStartClick={handleStartClick} />
    </div>
  );
};

export default Desktop;
