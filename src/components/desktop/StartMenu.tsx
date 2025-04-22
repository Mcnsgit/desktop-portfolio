// src/components/desktop/StartMenu.tsx
import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDesktop } from "../../context/DesktopContext";
import { useSounds } from "@/hooks/useSounds";
import Image from "next/image";
import styles from "../styles/StartMenu.module.scss";

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
  Monitor,
  Headphones,
  Camera,
  Coffee,
  Layout,
  Terminal,
  Paperclip
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
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: "about",
        title: "About Me",
        content: { type: "about" },
        minimized: false,
        position: { x: 150, y: 100 },
        size: { width: 500, height: 400 },
        type: "about",
        zIndex: 10,
      },
    });
  };

  const openProjectsFolder = () => {
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: "projects-folder",
        title: "My Projects",
        content: { type: "folder", folderId: "projects" },
        minimized: false,
        position: { x: 180, y: 120 },
        size: { width: 600, height: 450 },
        type: "folder",
        zIndex: 10,
      },
    });
  };

  const openContactWindow = () => {
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: "contact",
        title: "Contact Me",
        content: { type: "contact" },
        minimized: false,
        position: { x: 180, y: 120 },
        size: { width: 450, height: 380 },
        type: "contact",
        zIndex: 10,
      },
    });
  };

  const openTextEditor = () => {
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: `texteditor-${Date.now()}`,
        title: "Text Editor",
        content: { type: "texteditor" },
        minimized: false,
        position: { x: 200, y: 150 },
        size: { width: 600, height: 400 },
        type: "texteditor",
        zIndex: 10,
      },
    });
  };

  const openFileExplorer = () => {
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: `fileexplorer-${Date.now()}`,
        title: "File Explorer",
        content: { type: "fileexplorer", initialPath: "/home/guest" },
        minimized: false,
        position: { x: 150, y: 100 },
        size: { width: 700, height: 500 },
        type: "fileexplorer",
        zIndex: 10,
      },
    });
  };

  const openWeatherApp = () => {
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: `weatherapp-${Date.now()}`,
        title: "Weather App",
        content: { type: "weatherapp" },
        minimized: false,
        position: { x: 180, y: 120 },
        size: { width: 500, height: 400 },
        type: "weatherapp",
        zIndex: 10,
      },
    });
  };

  const openSettings = () => {
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: "settings",
        title: "Settings",
        content: { type: "settings" },
        minimized: false,
        position: { x: 200, y: 150 },
        size: { width: 500, height: 400 },
        type: "settings",
        zIndex: 10,
      },
    });
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
        // Open resume in a new window
        window.open("/cv.pdf", "_blank");
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

// Missing icons
const Calendar = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const Star = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const Clock = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export default StartMenu;