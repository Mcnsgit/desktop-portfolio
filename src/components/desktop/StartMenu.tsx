// src/components/desktop/StartMenu.tsx
import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSounds } from "@/hooks/useSounds";

import styles from "./StartMenu.module.scss";

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
  Clock,
  ListChecks
} from "lucide-react";

// Define menu structure
interface MenuItemStructure {
  id: string;
  label: string;
  icon: React.ReactNode;
  actionIdentifier?: string; // To be emitted by onAction prop
  actionPayload?: any; // Optional payload for the action
  submenu?: MenuItemStructure[];
  separator?: boolean;
  special?: boolean; // For styling special items like user, projects
}

interface StartMenuProps {
  onAction: (actionIdentifier: string, payload?: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onAction, isOpen, onClose }) => {
  const { playSound } = useSounds();
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // Handle outside click to close menu
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
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
  }, [isOpen, onClose]);

  // All actions now go through the onAction prop

  // Define menu items
  const menuItems: MenuItemStructure[] = [
    {
      id: "about",
      label: "About Me",
      icon: <User size={16} />,
      actionIdentifier: "open_app",
      actionPayload: { appType: "about", title: "About Me" },
      special: true,
    },
    {
      id: "projects",
      label: "My Projects",
      icon: <Briefcase size={16} />,
      actionIdentifier: "open_app",
      actionPayload: { appType: "folder", folderId: "projects", title: "My Projects" },
      special: true,
    },
    {
      id: "contact",
      label: "Contact Me",
      icon: <Mail size={16} />,
      actionIdentifier: "open_app",
      actionPayload: { appType: "contact", title: "Contact Me" },
      special: true,
    },
    {
      id: "cv",
      label: "Resume/CV",
      icon: <FileText size={16} />,
      actionIdentifier: "open_url",
      actionPayload: { url: "/cv.pdf" },
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
          actionIdentifier: "open_app",
          actionPayload: { appType: "texteditor", title: "Text Editor" },
        },
        {
          id: "fileexplorer",
          label: "File Explorer",
          icon: <FolderOpen size={16} />,
          actionIdentifier: "open_app",
          actionPayload: { appType: "fileexplorer", title: "File Explorer", initialPath: "/home/guest" },
        },
        {
          id: "todolist",
          label: "Todo List",
          icon: <ListChecks size={16} />,
          actionIdentifier: "open_app",
          actionPayload: { appType: "todolist", title: "Todo List" },
        },
        {
          id: "weatherapp",
          label: "Weather App",
          icon: <Cloud size={16} />,
          actionIdentifier: "open_app",
          actionPayload: { appType: "weatherapp", title: "Weather App" },
        },
        {
          id: "terminal",
          label: "Terminal",
          icon: <Terminal size={16} />,
          actionIdentifier: "open_app",
          actionPayload: { appType: "terminal", title: "Terminal" },
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
          actionIdentifier: "open_app",
          actionPayload: { appType: "mediaplayer", title: "Media Player" },
        },
        {
          id: "calculator",
          label: "Calculator",
          icon: <Layout size={16} />,
          actionIdentifier: "open_app",
          actionPayload: { appType: "calculator", title: "Calculator" },
        },
        {
          id: "calendar",
          label: "Calendar",
          icon: <Calendar height={16} width={16} />,
          actionIdentifier: "open_app",
          actionPayload: { appType: "calendar", title: "Calendar" },
        },
      ],
    },
    {
      id: "documents",
      label: "Documents",
      icon: <FileText size={16} />,
      actionIdentifier: "open_app",
      actionPayload: { appType: "documents", title: "Documents" },
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Star height={16} width={16} />,
      actionIdentifier: "open_app",
      actionPayload: { appType: "favorites", title: "Favorites" },
    },
    {
      id: "recent",
      label: "Recent",
      icon: <Clock height={16} width={16} />,
      actionIdentifier: "open_app",
      actionPayload: { appType: "recent", title: "Recent" },
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
      actionIdentifier: "open_app",
      actionPayload: { appType: "settings", title: "Settings" },
    },
    {
      id: "shutdown",
      label: "Shut Down",
      icon: <Power size={16} />,
      actionIdentifier: "shutdown_system",
    },
  ];

  // Handle menu item click
  const handleMenuItemClick = (item: MenuItemStructure) => {
    if (item.separator) return;

    playSound("click");

    if (item.actionIdentifier) {
      onAction(item.actionIdentifier, item.actionPayload);
    }

    if (item.submenu) {
      // Toggle submenu
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
    }
  };

  // Render submenu
  const renderSubmenu = (parentId: string, items: MenuItemStructure[]) => {
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
      {isOpen && (
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