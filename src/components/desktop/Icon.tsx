// components/desktop/Icon.tsx
import React, { useState } from 'react';
import styles from '../styles/Icon.module.scss';
import Image from 'next/image';
import { useSounds } from '../../hooks/useSounds';

interface IconProps {
  icon: string;
  label: string;
  position: { x: number; y: number };
  onDoubleClick: (e?: React.MouseEvent) => void;
}

const Icon: React.FC<IconProps> = ({ icon, label, position, onDoubleClick }) => {
  const { playSound } = useSounds();
  const [iconError, setIconError] = useState(false);

  // Handle double click with stopPropagation
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    console.log(`Double-clicked on ${label} icon`);

    playSound('click');
    onDoubleClick(e);
  };

  // Handle icon load errors
  const handleIconError = () => {
    console.warn(`Failed to load icon: ${icon}`);
    setIconError(true);
  };

  // Ensure icon path starts with a slash for Next.js Image component
  const getIconPath = () => {
    // If the path doesn't start with a slash, add it
    if (!icon.startsWith('/')) {
      return `/${icon}`;
    }
    return icon;
  };

  return (
    <div
      className={styles.icon}
      style={{
        left: position.x,
        top: position.y,
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div className={styles.iconImage}>
        {!iconError ? (
          <Image
            src={getIconPath()}
            alt={label}
            width={32}
            height={32}
            onError={handleIconError}
          />
        ) : (
          // Fallback for missing icons
          <div className={styles.fallbackIcon}>
            {label.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className={styles.iconLabel}>{label}</div>
    </div>
  );
};

export default Icon;