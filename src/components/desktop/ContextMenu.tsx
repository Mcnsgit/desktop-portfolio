// src/components/desktop/ContextMenu.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSounds } from '@/hooks/useSounds';
import { useDesktop } from '@/context/DesktopContext';
import styles from '../styles/ContextMenu.module.scss';

// Import icons (adjust import path as needed)
import {
  Copy,
  Scissors,
  Clipboard,
  Trash,
  FolderPlus,
  RefreshCcw,
  Star,
  Info,
  PenTool,
  Maximize
} from 'lucide-react';

interface ContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  targetId?: string;
  targetType?: 'file' | 'folder' | 'desktop' | string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  onClose,
  targetId,
  targetType = 'desktop'
}) => {
  const { playSound } = useSounds();
  const { state, dispatch } = useDesktop();
  const [isVisible, setIsVisible] = useState(true);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Adjusted position if menu goes outside viewport
  const [adjustedPosition, setAdjustedPosition] = useState({ x: position.x, y: position.y });

  // Keep track of selected items
  const selectedItems: string[] = []; // This would come from a selection context
  if (targetId) selectedItems.push(targetId);

  // Determine if we have clipboard content
  const hasClipboard = Boolean(state.clipboard?.files?.length);

  // Adjust position if menu is too close to edge
  useEffect(() => {
    if (contextMenuRef.current) {
      const rect = contextMenuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      // Adjust x if too close to right edge
      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 5;
      }

      // Adjust y if too close to bottom edge
      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 5;
      }

      setAdjustedPosition({ x, y });
    }
  }, [position]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
        setTimeout(onClose, 200); // Wait for animation to complete
      }
    };

    // Use setTimeout to prevent immediate closing
    const timerId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Helper for menu item clicks
  const handleItemClick = (action: () => void) => {
    playSound("click");
    setIsVisible(false);
    action();
    setTimeout(onClose, 200); // Wait for animation to complete
  };

  // Menu actions
  const handleNewFolder = () => {
    const newFolderId = `folder-${Date.now()}`;
    dispatch({
      type: "CREATE_FOLDER",
      payload: {
        id: newFolderId,
        title: "New Folder",
        icon: "/assets/win98-icons/png/directory_closed-1.png",
        items: [],
        position: {
          x: adjustedPosition.x - 40,
          y: adjustedPosition.y - 40,
        },
        parentId: null,
      },
    });
  };

  const handleCopy = () => {
    // If we have selected items, copy them
    if (selectedItems.length) {
      // Get the actual file data for each selected item
      const selectedItemsData = selectedItems.map(id => {
        // In a real implementation, find the actual item data
        const item = state.desktopItems.find(item => item.id === id);
        return item || { id };
      });

      dispatch({
        type: "UPDATE_CLIPBOARD",
        payload: {
          action: 'copy',
          files: selectedItemsData,
        },
      });
    }
  };

  const handleCut = () => {
    // Similar to copy, but mark for move
    if (selectedItems.length) {
      const selectedItemsData = selectedItems.map(id => {
        const item = state.desktopItems.find(item => item.id === id);
        return item || { id };
      });

      dispatch({
        type: "UPDATE_CLIPBOARD",
        payload: {
          action: 'cut',
          files: selectedItemsData,
        },
      });
    }
  };

  const handlePaste = () => {
    if (hasClipboard) {
      // If we're pasting to desktop or a folder
      const destinationId = targetType === 'folder' ? targetId ?? null : null;

      dispatch({
        type: "PASTE_ITEMS",
        payload: {
          destinationId,
          position: adjustedPosition,
          items: state.clipboard?.files || [], // Include clipboard items
        },
      });
    }
  };

  const handleDelete = () => {
    if (selectedItems.length) {
      selectedItems.forEach(id => {
        dispatch({
          type: "DELETE_ITEM",
          payload: { id },
        });
      });
    }
  };

  const handleRename = () => {
    if (targetId) {
      // In a real implementation, this would open a rename dialog
      console.log(`Rename item ${targetId}`);

      // For now, just log the action
      // dispatch({ type: "START_RENAME", payload: { id: targetId } });
    }
  };

  const handleAddToFavorites = () => {
    if (targetId) {
      dispatch({
        type: "ADD_TO_FAVORITES",
        payload: { id: targetId },
      });
    }
  };

  const handleProperties = () => {
    if (targetId) {
      // Open properties window
      console.log(`Show properties for ${targetId}`);

      // In a real implementation:
      // dispatch({
      //   type: "OPEN_PROPERTIES",
      //   payload: { id: targetId },
      // });
    }
  };

  const handleRefresh = () => {
    // Refresh desktop or folder contents
    window.location.reload();
  };

  const handleChangeBackground = () => {
    // This would change the desktop background
    dispatch({ type: "CYCLE_BACKGROUND" });
  };

  // Determine which menu items to show based on context
  let menuItems: any[] = [];

  // Desktop context menu
  if (targetType === 'desktop') {
    menuItems = [
      {
        id: 'newFolder',
        label: 'New Folder',
        icon: <FolderPlus size={16} />,
        action: handleNewFolder
      },
      {
        id: 'paste',
        label: 'Paste',
        icon: <Clipboard size={16} />,
        action: handlePaste,
        disabled: !hasClipboard
      },
      {
        id: 'refresh',
        label: 'Refresh',
        icon: <RefreshCcw size={16} />,
        action: handleRefresh
      },
      {
        id: 'background',
        label: 'Change Background',
        icon: <RefreshCcw size={16} />,
        action: handleChangeBackground
      },
    ];
  }
  // File or folder context menu
  else if (targetType === 'file' || targetType === 'folder') {
    menuItems = [
      {
        id: 'open',
        label: 'Open',
        icon: <Maximize size={16} />,
        action: () => {
          // Open file or folder based on selection
          if (targetId) {
            const item = state.desktopItems.find(item => item.id === targetId);
            if (item) {
              // This would simulate a double-click
              dispatch({
                type: "OPEN_WINDOW",
                payload: {
                  id: `${item.type}-${item.id}`,
                  title: item.title,
                  type: item.type,
                  content: { type: item.type, [`${item.type}Id`]: item.id },
                  minimized: false,
                  position: { x: 100, y: 100 },
                  size: { width: 500, height: 400 },
                  zIndex: 1,
                },
              });
            }
          }
        }
      },
      {
        id: 'copy',
        label: 'Copy',
        icon: <Copy size={16} />,
        action: handleCopy
      },
      {
        id: 'cut',
        label: 'Cut',
        icon: <Scissors size={16} />,
        action: handleCut
      },
      {
        id: 'rename',
        label: 'Rename',
        icon: <PenTool size={16} />,
        action: handleRename
      },
      // Only show Add to Favorites for non-desktop items
      {
        id: 'favorite',
        label: 'Add to Favorites',
        icon: <Star size={16} />,
        action: handleAddToFavorites
      },
      // Only show delete for non-desktop items
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash size={16} />,
        action: handleDelete,
        danger: true
      },
      {
        id: 'properties',
        label: 'Properties',
        icon: <Info size={16} />,
        action: handleProperties
      },
    ];
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.1 }}
        >
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`${styles.menuItem} ${item.disabled ? styles.disabled : ''} ${item.danger ? styles.danger : ''}`}
              onClick={() => !item.disabled && handleItemClick(item.action)}
            >
              <span className={styles.menuItemIcon}>{item.icon}</span>
              <span className={styles.menuItemLabel}>{item.label}</span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;