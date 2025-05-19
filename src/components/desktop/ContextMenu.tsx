// src/components/desktop/ContextMenu.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSounds } from '@/hooks/useSounds';
import { useDesktop } from '@/context/DesktopContext';
import { useFileSystem } from '@/context/FileSystemContext';
import styles from './ContextMenu.module.scss';
// import { DESKTOP_ICON_WIDTH, DESKTOP_ICON_HEIGHT } from "@/utils/constants"; // Import necessary constants

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

interface ContextMenuItem {
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
  targetId?: string;
  targetType?: 'file' | 'folder' | 'desktop' | 'folderBackground' | string;
  selectedItemIds?: Set<string>;
  desktopOffset?: { left: number; top: number }; // Added desktopOffset prop
  items?: ContextMenuItem[]; // New items prop
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  onClose,
  targetId,
  targetType = 'desktop',
  selectedItemIds = new Set<string>(),
  // desktopOffset = { left: 0, top: 0 }, // Default offset
  items: propItems // Use the new items prop
}) => {
  const { playSound } = useSounds();
  const { state, dispatch } = useDesktop();
  const fileSystem = useFileSystem();
  const [isVisible, setIsVisible] = useState(true);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Adjusted position if menu goes outside viewport
  const [adjustedPosition, setAdjustedPosition] = useState({ x: position.x, y: position.y });

  // Use passed selected IDs or fall back to targetId if only one item involved
  const actualSelectedCount = selectedItemIds.size;
  const isMultiSelect = actualSelectedCount > 1;
  const singleTargetId = actualSelectedCount === 1 ? selectedItemIds.values().next().value : targetId;

  // Determine if we have clipboard content
  const hasClipboard = Boolean(state.clipboard?.items?.length);

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
  const handleItemClick = (itemAction: () => void, disabled?: boolean) => {
    if (disabled) return;
    playSound("click");
    setIsVisible(false);
    itemAction(); // Changed from action() to itemAction() to avoid conflict
    setTimeout(onClose, 200); // Wait for animation to complete
  };

  // Menu actions
  const handleNewFolder = () => {
    const newFolderId = `folder-${Date.now()}`;
    const newPosition = {
      x: Math.max(10, adjustedPosition.x - 40),
      y: Math.max(10, adjustedPosition.y - 40),
    };
    dispatch({
      type: "CREATE_FOLDER",
      payload: {
        id: newFolderId,
        title: "New Folder",
        icon: "/assets/win98-icons/png/directory_closed-1.png",
        items: [],
        position: newPosition,
        parentId: null,
      },
    });
  };

  const handleCopy = () => {
    if (actualSelectedCount > 0) {
      const itemsToCopy = Array.from(selectedItemIds).map(id => state.desktopItems.find(item => item.id === id) || { id });
      dispatch({ type: "UPDATE_CLIPBOARD", payload: { action: 'copy', files: itemsToCopy } });
    }
  };

  const handleCut = () => {
    if (actualSelectedCount > 0) {
      const itemsToCut = Array.from(selectedItemIds).map(id => state.desktopItems.find(item => item.id === id) || { id });
      dispatch({ type: "UPDATE_CLIPBOARD", payload: { action: 'cut', files: itemsToCut } });
    }
  };

  const handlePaste = () => {
    if (hasClipboard) {
      // If we're pasting to desktop or a folder
      const destinationId = targetType === 'folder' || targetType === 'folderBackground' ? targetId ?? null : null;

      dispatch({
        type: "PASTE_ITEMS",
        payload: {
          destinationId,
          position: adjustedPosition,
          items: state.clipboard?.items || [], // Include clipboard items
        },
      });
    }
  };

  const handleDelete = async () => {
    if (actualSelectedCount > 0) {
      for (const id of selectedItemIds) {
        const itemToDelete = state.desktopItems.find(item => item.id === id);
        if (itemToDelete) {
          let deleteSuccess = true; // Assume success for non-FS items or if path is missing
          if (itemToDelete.path && (itemToDelete.type === 'file' || itemToDelete.type === 'folder' || itemToDelete.type.startsWith('text') || itemToDelete.type === 'imageviewer')) { // Check for actual file system types
            try {
              if (itemToDelete.type === 'folder') {
                console.log(`Attempting to delete directory from FS: ${itemToDelete.path}`);
                await fileSystem.removeDirectory(itemToDelete.path);
                console.log(`Successfully deleted directory from FS: ${itemToDelete.path}`);
              } else {
                console.log(`Attempting to delete file from FS: ${itemToDelete.path}`);
                await fileSystem.deleteFile(itemToDelete.path);
                console.log(`Successfully deleted file from FS: ${itemToDelete.path}`);
              }
            } catch (error) {
              deleteSuccess = false;
              console.error(`Failed to delete ${itemToDelete.type} from file system: ${itemToDelete.path}`, error);
              // Optionally, notify the user about the failure
            }
          } else {
             console.log(`Item ${id} (type: ${itemToDelete.type}) does not have a path or is not a synced FS type. Will only remove from context.`);
          }

          if (deleteSuccess) {
            dispatch({ type: "DELETE_ITEM", payload: { id } });
          }
        }
      }
      // Optionally clear selection state in parent via callback?
    }
  };

  const handleRename = () => {
    // Only allow rename if exactly one item is selected
    if (!isMultiSelect && singleTargetId) {
      console.log(`Rename item ${singleTargetId}`);
      // dispatch({ type: "START_RENAME", payload: { id: singleTargetId } });
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
  let menuItemsToRender: ContextMenuItem[] = [];

  if (propItems && propItems.length > 0) {
    menuItemsToRender = propItems;
  } else {
    // Fallback to internal logic if propItems is not provided
    if (targetType === 'desktop' || targetType === 'folderBackground') {
      menuItemsToRender = [
        { id: 'newFolder', label: 'New Folder', icon: <FolderPlus size={16} />, action: handleNewFolder },
        { id: 'paste', label: 'Paste', icon: <Clipboard size={16} />, action: handlePaste, disabled: !hasClipboard },
        { id: 'refresh', label: 'Refresh', icon: <RefreshCcw size={16} />, action: handleRefresh },
        // Only show Change Background on desktop
        ...(targetType === 'desktop' ? [{ id: 'changeBackground', label: 'Change Background', icon: <PenTool size={16} />, action: handleChangeBackground }] : []),
      ];
    }
    // File or folder context menu (single or multiple selection)
    else if (targetType === 'file' || targetType === 'folder') {
      const firstItem = state.desktopItems.find(item => item.id === singleTargetId);
      menuItemsToRender = [
        // Only show Open if single selection
        ...(!isMultiSelect && firstItem ? [{
            id: 'open',
            label: 'Open',
            icon: <Maximize size={16} />,
            action: () => { /* ... open item logic using firstItem ... */ }
        }] : []),
        {
          id: 'copy',
          label: 'Copy',
          icon: <Copy size={16} />,
          action: handleCopy,
          disabled: actualSelectedCount === 0 // Disable if nothing selected (shouldn't happen here)
        },
        {
          id: 'cut',
          label: 'Cut',
          icon: <Scissors size={16} />,
          action: handleCut,
          disabled: actualSelectedCount === 0
        },
        {
          id: 'rename',
          label: 'Rename',
          icon: <PenTool size={16} />,
          action: handleRename,
          disabled: isMultiSelect || actualSelectedCount === 0 // Disable for multi-select
        },
        {
          id: 'favorite',
          label: 'Add to Favorites',
          icon: <Star size={16} />,
          action: handleAddToFavorites, // AddToFavorites might need multi-select support
          disabled: isMultiSelect || actualSelectedCount === 0 // Example: Disable for multi-select
        },
        {
          id: 'delete',
          label: actualSelectedCount > 1 ? 'Delete Items' : 'Delete',
          icon: <Trash size={16} />,
          action: handleDelete,
          danger: true,
          disabled: actualSelectedCount === 0
        },
        // Only show Properties if single selection
        ...(!isMultiSelect && firstItem ? [{
            id: 'properties',
            label: 'Properties',
            icon: <Info size={16} />,
            action: handleProperties // Needs singleTargetId
        }] : []),
      ];
    }
  }

  // Animation variants
  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.1 } },
  };

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
                key={item.id || item.label || index} // Use id, then label, then index as key
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