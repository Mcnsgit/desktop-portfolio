// src/components/desktop/StartMenu.tsx
import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDesktop } from "../../context/DesktopContext";
import { useSounds } from "@/hooks/useSounds";

import styles from "./StartMenu.module.scss";
import { launchApplication } from "../../utils/appLauncher"; // Import launchApplication

// Import icons
import {
  User,
  FileText,
  Briefcase,
  Mail,
  FolderOpen,
  Edit3,
  Cloud,
  Settings,
  Power,
  ChevronRight,
  Headphones,
  Layout,
  Terminal,
  Calendar, // Assuming Calendar, Star, Clock are custom or from lucide-react elsewhere
  Star,
  Clock
} from "lucide-react";

// Define menu structure
interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action?: () => void;
  submenu?: MenuItem[];
  separator?: boolean;
  special?: boolean;
}

const StartMenu: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const { playSound } = useSounds();
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = React.useState<string | null>(null);

  // Handle outside click to close menu
  useEffect(() => {
    if (!state.startMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        dispatch({
          type: "TOGGLE_START_MENU",
          payload: { startMenuOpen: false }
        });
      }
    };

    // Add with delay to prevent immediate closing when clicking Start button
    const timerId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [state.startMenuOpen, dispatch]);

  // Open window handlers
  const openAboutWindow = () => {
    launchApplication("about", { dispatch, existingWindows: state.windows }, { title: "About Me" });
  };

  const openProjectsFolder = () => {
    launchApplication("folder", { dispatch, existingWindows: state.windows }, { 
      folderId: "projects", 
      title: "My Projects" 
    });
  };

  const openContactWindow = () => {
    launchApplication("contact", { dispatch, existingWindows: state.windows }, { title: "Contact Me" });
  };

  const openTextEditor = () => {
    launchApplication("texteditor", { dispatch, existingWindows: state.windows }, { title: "Text Editor" });
  };

  const openFileExplorer = () => {
    launchApplication("fileexplorer", { dispatch, existingWindows: state.windows }, { 
      title: "File Explorer", 
      initialPath: "/home/guest" 
    });
  };

  const openWeatherApp = () => {
    launchApplication("weatherapp", { dispatch, existingWindows: state.windows }, { title: "Weather App" });
  };

  const openSettings = () => {
    launchApplication("settings", { dispatch, existingWindows: state.windows }, { title: "Settings" });
  };

  const shutdown = () => {
    window.location.reload();
  };

  // Define menu items
  const menuItems: MenuItem[] = [
    {
      id: "about",
      label: "About Me",
      icon: <User size={16} />,
      action: openAboutWindow,
      special: true,
    },
    {
      id: "projects",
      label: "My Projects",
      icon: <Briefcase size={16} />,
      action: openProjectsFolder,
      special: true,
    },
    {
      id: "contact",
      label: "Contact Me",
      icon: <Mail size={16} />,
      action: openContactWindow,
      special: true,
    },
    {
      id: "cv",
      label: "Resume/CV",
      icon: <FileText size={16} />,
      action: () => {
        window.open("/cv.pdf", "_blank");
        dispatch({ type: "TOGGLE_START_MENU", payload: { startMenuOpen: false } });
      },
      special: true,
    },
    {
      id: "separator1",
      label: "",
      icon: <></>,
      separator: true,
    },
    {
      id: "programs",
      label: "Programs",
      icon: <Layout size={16} />,
      submenu: [
        {
          id: "texteditor",
          label: "Text Editor",
          icon: <Edit3 size={16} />,
          action: openTextEditor,
        },
        {
          id: "fileexplorer",
          label: "File Explorer",
          icon: <FolderOpen size={16} />,
          action: openFileExplorer,
        },
        {
          id: "weatherapp",
          label: "Weather App",
          icon: <Cloud size={16} />,
          action: openWeatherApp,
        },
        {
          id: "terminal",
          label: "Terminal",
          icon: <Terminal size={16} />,
          action: () => { },
        },
        {
          id: "separator2",
          label: "",
          icon: <></>,
          separator: true,
        },
        {
          id: "mediaplayer",
          label: "Media Player",
          icon: <Headphones size={16} />,
          action: () => { },
        },
        {
          id: "calculator",
          label: "Calculator",
          icon: <Layout size={16} />,
          action: () => { },
        },
        {
          id: "calendar",
          label: "Calendar",
          icon: <Calendar height={16} width={16} />,
          action: () => { },
        },
      ],
    },
    {
      id: "documents",
      label: "Documents",
      icon: <FileText size={16} />,
      action: () => { },
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Star height={16} width={16} />,
      action: () => { },
    },
    {
      id: "recent",
      label: "Recent",
      icon: <Clock height={16} width={16} />,
      action: () => { },
    },
    {
      id: "separator3",
      label: "",
      icon: <></>,
      separator: true,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={16} />,
      action: openSettings,
    },
    {
      id: "shutdown",
      label: "Shut Down",
      icon: <Power size={16} />,
      action: shutdown,
    },
  ];

  // Handle menu item click
  const handleMenuItemClick = (item: MenuItem) => {
    if (item.separator) return;

    playSound("click");

    if (item.submenu) {
      // Toggle submenu
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
      return;
    }

    if (item.action) {
      item.action();

      // Close start menu after action
      dispatch({
        type: "TOGGLE_START_MENU",
        payload: { startMenuOpen: false }
      });
    }
  };

  // Render submenu
  const renderSubmenu = (parentId: string, items: MenuItem[]) => {
    if (activeSubmenu !== parentId) return null;

    return (
      <motion.div
        className={styles.submenu}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.15 }}
      >
        {items.map((item) => (
          <React.Fragment key={item.id}>
            {item.separator ? (
              <div className={styles.separator} />
            ) : (
              <div
                className={styles.menuItem}
                onClick={() => handleMenuItemClick(item)}
              >
                <span className={styles.menuItemIcon}>{item.icon}</span>
                <span className={styles.menuItemLabel}>{item.label}</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {state.startMenuOpen && (
        <motion.div
          ref={menuRef}
          className={styles.startMenu}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.startMenuHeader}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <User size={32} strokeWidth={1.5} />
              </div>
              <div className={styles.userName}>User</div>
            </div>
          </div>

          <div className={styles.menuContent}>
            {/* Special items (about, projects, etc.) */}
            <div className={styles.specialItems}>
              {menuItems
                .filter((item) => item.special)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.specialItem}`}
                    onClick={() => handleMenuItemClick(item)}
                  >
                    <span className={styles.specialItemIcon}>{item.icon}</span>
                    <span className={styles.specialItemLabel}>{item.label}</span>
                  </div>
                ))}
            </div>

            {/* Main menu items */}
            <div className={styles.menuItems}>
              {menuItems
                .filter((item) => !item.special)
                .map((item) => (
                  <React.Fragment key={item.id}>
                    {item.separator ? (
                      <div className={styles.separator} />
                    ) : (
                      <div
                        className={`${styles.menuItem} ${item.submenu ? styles.hasSubmenu : ""
                          } ${activeSubmenu === item.id ? styles.active : ""}`}
                        onClick={() => handleMenuItemClick(item)}
                      >
                        <span className={styles.menuItemIcon}>{item.icon}</span>
                        <span className={styles.menuItemLabel}>{item.label}</span>
                        {item.submenu && (
                          <ChevronRight size={14} className={styles.submenuIcon} />
                        )}

                        {/* Render submenu if active */}
                        {item.submenu &&
                          renderSubmenu(item.id, item.submenu)}
                      </div>
                    )}
                  </React.Fragment>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Dummy components for lucide-react icons if not directly available
// const Calendar = (props: any) => <Paperclip {...props} />; // Placeholder
// const Star = (props: any) => <Paperclip {...props} />;     // Placeholder
// const Clock = (props: any) => <Paperclip {...props} />;    // Placeholder

export default StartMenu;