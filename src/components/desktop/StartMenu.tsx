// components/desktop/StartMenu.tsx
import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDesktop } from "../../context/DesktopContext";
import styles from "../styles/StartMenu.module.scss";
import Image from "next/image";
import { useSounds } from "@/hooks/useSounds";
import {
  openTextEditor,
  openFileExplorer,
  openWeatherApp,
} from "../../utils/windowServices/fileHandlers";

// Define menu items with proper icons and actions
const menuItems = [
  {
    action: "about",
    label: "About Me",
    icon: "/assets/win98-icons/png/address_book_user.png",
  },
  {
    action: "projects",
    label: "My Projects",
    icon: "/assets/win98-icons/png/briefcase-4.png",
  },
  {
    action: "contact",
    label: "Contact Me",
    icon: "/assets/win98-icons/png/msn3-4.png",
  },
  { action: "cv", label: "CV", icon: "/assets/win98-icons/png/user_card.png" },
];

// Define programs that appear in the Programs submenu
const programItems = [
  {
    action: "texteditor",
    label: "Text Editor",
    icon: "/assets/win98-icons/png/notepad_file-0.png",
  },
  {
    action: "fileexplorer",
    label: "File Explorer",
    icon: "/assets/win98-icons/png/directory_explorer-0.png",
  },
  {
    action: "weatherapp",
    label: "Weather App",
    icon: "/assets/win98-icons/png/sun-0.png",
  },
];

const StartMenu: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const { playSound } = useSounds();
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close menu
  useEffect(() => {
    if (!state.startMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        dispatch({
          type: "TOGGLE_START_MENU",
          payload: { startMenuOpen: false },
        });
      }
    };

    // Add after a short delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [state.startMenuOpen, dispatch]);

  const handleMenuItemClick = (action: string) => {
    playSound("click");

    switch (action) {
      case "about":
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
            zIndex: 1,
          },
        });
        break;

      case "projects":
        openFileExplorer(dispatch, "/projects");
        break;

      case "cv":
        // Open resume in a new window
        window.open("/cv.pdf", "_blank");
        break;

      case "contact":
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
            zIndex: 1,
          },
        });
        break;

      case "texteditor":
        openTextEditor(dispatch);
        break;

      case "fileexplorer":
        openFileExplorer(dispatch);
        break;

      case "weatherapp":
        openWeatherApp(dispatch);
        break;
    }

    // Close menu after selection
    dispatch({ type: "TOGGLE_START_MENU", payload: { startMenuOpen: false } });
  };

  return (
    <AnimatePresence>
      {state.startMenuOpen && (
        <motion.div
          ref={menuRef}
          className={styles.startMenu}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.menuHeader}>
            <div className={styles.menuTitle}>My Portfolio</div>
          </div>

          <div className={styles.menuItems}>
            {/* Programs menu with submenu */}
            <div className={`${styles.menuItem} ${styles.programs}`}>
              <Image
                width={16}
                height={16}
                src="/assets/win98-icons/png/directory_dial_up_networking-0.png"
                alt="Programs"
              />
              <span>Programs</span>

              <div className={styles.submenu}>
                {programItems.map((item) => (
                  <div
                    key={item.action}
                    className={styles.menuItem}
                    onClick={() => handleMenuItemClick(item.action)}
                  >
                    <Image
                      width={16}
                      height={16}
                      src={item.icon}
                      alt={item.label}
                    />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.divider} />

            {/* Regular menu items */}
            {menuItems.map((item) => (
              <div
                key={item.action}
                className={styles.menuItem}
                onClick={() => handleMenuItemClick(item.action)}
              >
                <Image
                  width={16}
                  height={16}
                  src={item.icon}
                  alt={item.label}
                />
                <span>{item.label}</span>
              </div>
            ))}

            <div className={styles.divider} />

            {/* Settings and Shutdown */}
            <div
              className={styles.menuItem}
              onClick={() => handleMenuItemClick("settings")}
            >
              <Image
                width={16}
                height={16}
                src="/assets/win98-icons/png/directory_control_panel_cool-0.png"
                alt="Settings"
              />
              <span>Settings</span>
            </div>
            <div
              className={styles.menuItem}
              onClick={() => window.location.reload()}
            >
              <Image
                width={16}
                height={16}
                src="/assets/win98-icons/png/shut_down_normal-0.png"
                alt="Shut Down"
              />
              <span>Shut Down</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartMenu;
