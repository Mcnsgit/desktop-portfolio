import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./StartMenu.module.scss";
import { StartMenuItems } from "@/config/data";
import { DesktopFile, FileType } from "@/types/fs";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface StartMenuProps {
  onAction: (actionIdentifier: string, payload?: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onAction, isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setActiveSubmenu(null);
      return;
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timerId = setTimeout(() => { document.addEventListener("mousedown", handleClickOutside); }, 100);
    return () => { clearTimeout(timerId); document.removeEventListener("mousedown", handleClickOutside); };
  }, [isOpen, onClose]);

  const handleMenuItemClick = (item: DesktopFile) => {
    if (item.type === FileType.SEPARATOR) return;

    if (item.data.children) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
    } else {
      onAction("OPEN_WINDOW", { id: item.id });
      onClose();
    }
  };

  const renderMenuItems = (items: DesktopFile[], isSubmenu = false) => {
    return items.map((item) => {
      if (item.type === FileType.SEPARATOR) {
        return <div key={item.id} className={styles.separator} />;
      }

      const hasSubmenu = !!item.data.children;

      return (
        <div
          key={item.id}
          className={`${styles.menuItem} ${hasSubmenu ? styles.hasSubmenu : ''} ${activeSubmenu === item.id ? styles.active : ''}`}
          onClick={(e) => {
            if (isSubmenu) e.stopPropagation();
            handleMenuItemClick(item);
          }}
          onMouseEnter={() => hasSubmenu && setActiveSubmenu(item.id)}
        >
          <span className={styles.menuItemIcon}>
            <Image src={item.icon} alt={item.name} width={20} height={20} />
          </span>
          <span className={styles.menuItemLabel}>{item.name}</span>
          {hasSubmenu && <ChevronRight size={16} className={styles.submenuIcon} />}

          {hasSubmenu && activeSubmenu === item.id && (
            <motion.div
              className={styles.submenu}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
            >
              {renderMenuItems(item.data.children!, true)}
            </motion.div>
          )}
        </div>
      );
    });
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
          <div className={styles.startMenuSidebar}>
            <div className={styles.sidebarText}>
              <span>Windows</span><span>98</span>
            </div>
          </div>
          <div className={styles.menuContent}>
            {renderMenuItems(StartMenuItems)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartMenu;