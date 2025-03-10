// components/desktop/ContextMenu.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../styles/ContextMenu.module.scss';

interface ContextMenuProps {
  onClose: () => void;
  position: { x: number; y: number };
  items: Array<{
    label: string;
    action: () => void;
    disabled?: boolean;
  }>;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ onClose, position, items }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Handle click outside to close the menu
  useEffect(() => {
    const handleClickOutside = () => {
      setIsVisible(false);
      setTimeout(onClose, 200); // Wait for animation to complete
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);
  
  const handleItemClick = (action: () => void) => {
    action();
    setIsVisible(false);
    setTimeout(onClose, 200);
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.contextMenu}
          style={{ top: position.y, left: position.x }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.1 }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={`${styles.menuItem} ${item.disabled ? styles.disabled : ''}`}
              onClick={() => !item.disabled && handleItemClick(item.action)}
            >
              {item.label}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;