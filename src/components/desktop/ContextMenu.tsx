// src/components/desktop/ContextMenu.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSounds } from '@/hooks/useSounds';
import styles from './ContextMenu.module.scss';


// Icons are now passed via the items prop from Desktop.tsx, so no need to import them here

export interface ContextMenuItem {
  id?: string;
  label: string;
  action: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

interface ContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  items: ContextMenuItem[]; // Changed from optional to required, actions come from Desktop.tsx
  targetId?: string; // Still useful for context, but actions are pre-defined
  targetType?: string; // Still useful for context
  selectedItemIds?: Set<string>; // Still useful for context
  // desktopModel?: DesktopModel; // No longer needed if actions are passed in items
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  onClose,
  items: propItems, // Renamed to propItems to avoid conflict with internal state/logic if any was kept
  // targetId, // Not directly used by ContextMenu if actions are pre-bound
  // targetType = 'desktop', // Not directly used
  // selectedItemIds = new Set<string>(), // Not directly used
}) => {
  const { playSound } = useSounds();
  // const { state, dispatch } = useDesktop(); // REMOVE
  // const fileSystem = useFileSystem(); // REMOVE
  const [isVisible, setIsVisible] = useState(true);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const [adjustedPosition, setAdjustedPosition] = useState({ x: position.x, y: position.y });

  // const actualSelectedCount = selectedItemIds.size;
  // const isMultiSelect = actualSelectedCount > 1;
  // const singleTargetId = actualSelectedCount === 1 ? selectedItemIds.values().next().value : targetId;
  // const hasClipboard = Boolean(state.clipboard?.items?.length); // REMOVE - clipboard state managed by Desktop.tsx/DesktopModel

  useEffect(() => {
    if (contextMenuRef.current) {
      const rect = contextMenuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 5;
      }

      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 5;
      }

      setAdjustedPosition({ x, y });
    }
  }, [position]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
        setTimeout(onClose, 200);
      }
    };

    const timerId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleItemClick = (itemAction: () => void, disabled?: boolean) => {
    if (disabled) return;
    playSound("click");
    setIsVisible(false);
    itemAction();
    setTimeout(onClose, 200);
  };

  // REMOVE ALL INTERNAL ACTION HANDLERS like handleNewFolder, handleDelete, handleCopy, handlePaste etc.
  // These are now supplied via the `items` prop from Desktop.tsx

  // Determine which menu items to render
  // This logic is simplified: we always render propItems.
  // The logic to decide *which* items appear is handled in Desktop.tsx's contextMenuItemsFromModel.
  const menuItemsToRender: ContextMenuItem[] = propItems;

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.1 } },
  };

  if (!menuItemsToRender || menuItemsToRender.length === 0) {
    // Fallback or safety net: if no items are passed, close immediately to prevent an empty menu.
    // This shouldn't happen if Desktop.tsx always provides some items (e.g., Refresh).
    console.warn("[ContextMenu] No items provided to render. Closing.");
    onClose();
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={contextMenuRef}
          className={styles.contextMenu}
          style={{
            top: adjustedPosition.y,
            left: adjustedPosition.x,
          }}
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <ul>
            {menuItemsToRender.map((item, index) => (
              <li
                key={item.id || item.label || index}
                onClick={() => handleItemClick(item.action, item.disabled)}
                className={`${styles.menuItem} ${item.disabled ? styles.disabled : ''} ${item.danger ? styles.danger : ''}`}
              >
                {item.icon && <span className={styles.menuIcon}>{item.icon}</span>}
                <span className={styles.menuLabel}>{item.label}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;