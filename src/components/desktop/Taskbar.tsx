// src/components/desktop/Taskbar.tsx
import React, { useState, useEffect, useCallback } from "react";
// import { useDesktop } from "../../context/DesktopContext";
// import { useSounds } from "../../hooks/useSounds";
import styles from "./Taskbar.module.scss";
// import Image from "next/image";
// import { launchApplication } from "../../utils/appLauncher"; // Import launchApplication
import {
  // ChevronRight,
  Clock,
  // Volume2,
  // Wifi,
  // Battery,
  // User
} from "lucide-react";

// Import StartMenu dynamically or define it if it becomes part of Taskbar directly
// For now, assuming Desktop.tsx handles StartMenu visibility and rendering.
// If StartMenu is to be toggled *by* Taskbar and rendered *by* Taskbar, it needs props like onAction.
// import StartMenu from "./StartMenu"; // StartMenu is handled by Desktop.tsx, not Taskbar

// New interface for the window objects Taskbar expects
export interface TaskbarWindow {
  id: string;
  title: string;
  isActive: boolean; // Mapped from WindowModel.isFocused
  isMinimized: boolean; // From WindowModel.isMinimized
  icon?: string; // Optional: from WindowModel.sourceItem.icon
}

interface TaskbarProps {
  windows: TaskbarWindow[]; // Use the new interface
  onWindowSelect: (windowId: string) => void;
  onStartClick: () => void; // Renamed from onStartMenuAction for clarity, Desktop will toggle StartMenu visibility
  // onStartMenuAction: (action: string) => void; // Replaced by specific onStartClick and StartMenu handling in Desktop
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onWindowSelect, onStartClick }) => {
  // const [showStartMenu, setShowStartMenu] = useState(false); // Visibility managed by Desktop.tsx
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  const updateClock = useCallback(() => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setCurrentDate(now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }));
  }, []);

  useEffect(() => {
    updateClock();
    const timerId = setInterval(updateClock, 1000 * 30); // Update every 30 seconds
    return () => clearInterval(timerId);
  }, [updateClock]);

  return (
    <div className={styles.taskbar}> {/* Use styles.taskbar for the main div */}
      <button 
        className={styles.startButton} // Use styles for start button
        onClick={(e) => {
          e.stopPropagation();
          onStartClick(); // Call the new prop
        }}
      >
        <span role="img" aria-label="Windows logo">🪟</span> {/* Better accessibility for emoji */}
        Start
      </button>
      
      <div className={styles.taskbarItems}> {/* Use styles for items container */}
        {/* Filter for open, non-minimized windows to show on taskbar actively */}
        {/* Or, show all open windows and indicate minimized state visually */}
        {windows.map(window => (
          <button
            key={window.id}
            className={`${styles.taskbarItem} ${window.isActive ? styles.active : ''} ${window.isMinimized ? styles.minimized : ''}`}
            onClick={() => onWindowSelect(window.id)}
            title={window.title} // Tooltip for full title
          >
            {/* Optional: Add icon here if available: {window.icon && <Image ... />} */}
            <span className={styles.taskbarItemTitle}>{window.title}</span>
          </button>
        ))}
      </div>
      
      <div className={styles.systemTray}> {/* Use styles for system tray */}
        {/* Add other system tray icons here if needed */}
        <div className={styles.clockContainer} title={currentDate}>
          <Clock size={14} className={styles.clockIcon} />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* StartMenu rendering is now handled by Desktop.tsx based on its state 
          If Taskbar were to control StartMenu directly, it would be here, like:
          showStartMenu && <StartMenu onAction={handleStartMenuAction} onClose={() => setShowStartMenu(false)}/> 
      */}
    </div>
  );
};

export default Taskbar;
 
//   // Handle Start button click
//   const handleStartClick = useCallback((e: React.MouseEvent) => {
//     e.stopPropagation(); // Prevent click from bubbling to desktop
//     e.preventDefault(); // Prevent default behavior

//     playSound("click");
//     onStartClick();
//   }, [onStartClick, playSound]);

//   // Handle taskbar item click
//   const handleTaskbarItemClick = useCallback((windowId: string) => {
//     const windowData = state.windows.find(w => w.id === windowId);
//     if (!windowData) return;

//     // If window is minimized, restore it
//     if (windowData.minimized) {
//       dispatch({
//         type: "RESTORE_WINDOW",
//         payload: { id: windowId }
//       });

//       // Focus the window
//       dispatch({
//         type: "FOCUS_WINDOW",
//         payload: { id: windowId }
//       });

//       playSound("click");
//     }
//     // If window is already active, minimize it
//     else if (state.activeWindowId === windowId) {
//       dispatch({
//         type: "MINIMIZE_WINDOW",
//         payload: { id: windowId }
//       });

//       playSound("click");
//     }
//     // Otherwise, focus the window
//     else {
//       dispatch({
//         type: "FOCUS_WINDOW",
//         payload: { id: windowId }
//       });

//       playSound("click");
//     }
//   }, [dispatch, playSound, state.activeWindowId, state.windows]);

//   // Show tooltip on hover
//   const handleTaskbarItemMouseEnter = useCallback((e: React.MouseEvent, windowId: string) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     setShowTooltip({
//       windowId,
//       position: {
//         x: rect.left + rect.width / 2,
//         y: rect.top - 5,
//       },
//     });
//   }, []);

//   // Hide tooltip on mouse leave
//   const handleTaskbarItemMouseLeave = useCallback(() => {
//     setShowTooltip(null);
//   }, []);

//   // Get icon for window type
//   const getWindowIcon = useCallback((windowType: string) => {
//     // This can now use getAppIcon from appLauncher for consistency if appName matches windowType
//     // Or remain specific if taskbar icons differ from generic app icons
//     switch (windowType) {
//       case 'folder':
//         return '/assets/win98-icons/png/directory_open-0.png';
//       case 'texteditor':
//         return '/assets/win98-icons/png/notepad_file-0.png';
//       case 'imageviewer':
//         return '/assets/win98-icons/png/media_player_file-0.png';
//       case 'project':
//         return '/assets/win98-icons/png/joystick-5.png';
//       case 'weatherapp':
//         return '/assets/win98-icons/png/sun-0.png';
//       case 'aboutme': // Corrected from 'about' to match WINDOW_TYPES.ABOUT if it's 'aboutme' or use getAppIcon
//       case 'about':
//         return '/assets/win98-icons/png/address_book_user.png';
//       case 'contact':
//         return '/assets/win98-icons/png/modem-5.png';
//       case 'browser':
//         return '/assets/win98-icons/png/html-0.png';
//       default:
//         return '/assets/win98-icons/png/application_blue_lines-0.png'; // More generic default
//     }
//   }, []);

//   // Quick launch handlers
//   const handleQuickLaunchFileExplorer = useCallback(() => {
//     launchApplication("fileexplorer", { dispatch, existingWindows: state.windows }, {
//       title: "File Explorer",
//       initialPath: "/home/guest",
//       // id can be omitted to be auto-generated by factory
//     });
//     playSound("windowOpen"); // Keep sound if specific to quick launch action
//   }, [dispatch, playSound, state.windows]);

//   const handleQuickLaunchTextEditor = useCallback(() => {
//     launchApplication("texteditor", { dispatch, existingWindows: state.windows }, {
//       title: "Text Editor - Untitled",
//       // filePath is undefined by default in factory if not provided
//     });
//     playSound("windowOpen");
//   }, [dispatch, playSound, state.windows]);

//   const handleQuickLaunchWebBrowser = useCallback(() => {
//     launchApplication("browser", { dispatch, existingWindows: state.windows }, {
//       title: "Web Browser",
//       // initialUrl can be set here if desired, e.g., { initialUrl: "https://google.com" }
//     });
//     playSound("windowOpen");
//   }, [dispatch, playSound, state.windows]);

//   return (
//     <div
//       className={styles.taskbar}
//       onClick={(e) => e.stopPropagation()}
//     >
//       {/* Start button */}
//       <div
//         className={styles.startButton}
//         onClick={handleStartClick}
//       >
//         <Image
//           src="/assets/win98-icons/png/computer_explorer-3.png"
//           alt="Start"
//           width={16}
//           height={16}
//         />
//         <span>Start</span>
//       </div>

//       {/* Quick launch icons */}
//       <div className={styles.quickLaunch}>
//         <button className={styles.quickLaunchButton} title="File Explorer" onClick={handleQuickLaunchFileExplorer}>
//           <Image
//             src="/assets/win98-icons/png/directory_explorer-0.png"
//             alt="Explorer"
//             width={16}
//             height={16}
//           />
//         </button>
//         <button className={styles.quickLaunchButton} title="Text Editor" onClick={handleQuickLaunchTextEditor}>
//           <Image
//             src="/assets/win98-icons/png/notepad_file-0.png"
//             alt="Notepad"
//             width={16}
//             height={16}
//           />
//         </button>
//         <button className={styles.quickLaunchButton} title="Web Browser" onClick={handleQuickLaunchWebBrowser}>
//           <Image
//             src="/assets/win98-icons/png/html-0.png"
//             alt="Browser"
//             width={16}
//             height={16}
//           />
//         </button>

//         <div className={styles.separator}></div>
//       </div>

//       {/* Window buttons */}
//       <div className={styles.windowButtons}>
//         {state.windows.map((window) => (
//           <button
//             key={window.id}
//             className={`${styles.windowButton} ${state.activeWindowId === window.id ? styles.active : ""} ${window.minimized ? styles.minimized : ""}`}
//             onClick={() => handleTaskbarItemClick(window.id)}
//             onMouseEnter={(e) => handleTaskbarItemMouseEnter(e, window.id)}
//             onMouseLeave={handleTaskbarItemMouseLeave}
//             title={window.title}
//           >
//             <div className={styles.windowButtonIcon}>
//               <Image
//                 src={getWindowIcon(window.type)}
//                 alt={window.title}
//                 width={16}
//                 height={16}
//               />
//             </div>
//             <span className={styles.windowButtonText}>{window.title}</span>
//           </button>
//         ))}
//       </div>

//       {/* System tray */}
//       <div className={styles.systemTray}>
//         <button className={styles.trayIcon} title="Volume">
//           <Volume2 size={16} />
//         </button>
//         <button className={styles.trayIcon} title="Network">
//           <Wifi size={16} />
//         </button>
//         <button className={styles.trayIcon} title="Battery">
//           <Battery size={16} />
//         </button>

//         {/* Clock and date */}
//         <div className={styles.clock} title={currentDate}>
//           <Clock size={14} className={styles.clockIcon} />
//           <span>{currentTime}</span>
//         </div>
//       </div>

//       {/* Window tooltips */}
//       {showTooltip && (
//         <div
//           className={styles.windowTooltip}
//           style={{
//             left: `${showTooltip.position.x}px`,
//             top: `${showTooltip.position.y}px`,
//           }}
//         >
//           {state.windows.find(w => w.id === showTooltip.windowId)?.title || "Window"}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Taskbar;
// export default Taskbar;