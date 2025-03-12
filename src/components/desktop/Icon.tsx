// components/desktop/Icon.tsx
import React, { useState } from 'react';
import styles from '../styles/Icon.module.scss';
import { useSounds } from '../../hooks/useSounds';

interface IconProps {
  icon: string;
  label: string;
  position: { x: number; y: number };
  onDoubleClick: (e?: React.MouseEvent) => void;
}

// Simple colored icon component as a fallback
const ColoredIcon = ({ letter }: { letter: string }) => {
  return (
    <div style={{
      width: '32px',
      height: '32px',
      backgroundColor: '#1e90ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      color: 'white',
      fontSize: '16px',
      fontWeight: 'bold'
    }}>
      {letter}
    </div>
  );
};

const Icon: React.FC<IconProps> = ({ icon, label, position, onDoubleClick }) => {
  const { playSound } = useSounds();
  const [iconError, setIconError] = useState(false);


  // Handle double click with stopPropagation
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    console.log(`Double-clicked on ${label} icon`);
    playSound('doubleClick');
    onDoubleClick(e);
  };


  // Fix the icon path by ensuring it has the correct format
  const fixIconPath = (path: string): string => {
    // Check if path needs PNG extension
    if (!path.endsWith('.png') && !path.endsWith('.ico') && !path.endsWith('.jpg')) {
      path = `${path}.png`;
    }

    // Add leading slash if missing
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }

    // Fix common path issues
    if (path.includes('assets/win98-icons/icons/png')) {
      // Remove extra 'icons/' part if present
      path = path.replace('icons/png', 'png');
    }

    // Try fallback paths if needed
    if (path.includes('/assets/') && !path.includes('/public/')) {
      // Check if we need to adjust for Next.js public folder structure
      const pathWithoutLeadingSlash = path.startsWith('/') ? path.substring(1) : path;
      if (!pathWithoutLeadingSlash.startsWith('public/')) {
        console.log(`Using icon path: ${path}`);
        return path;
      }
    }

    console.log(`Using icon path: ${path}`);
    return path;
  };


  // Try to render normal img - if it fails, show colored fallback
  return (
    <div
      className={styles.icon}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: '80px',
        height: '90px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        textAlign: 'center',
        cursor: 'pointer',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div
        style={{
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '40px',
          height: '40px',
        }}
      >
        {!iconError ? (
          <img
            src={fixIconPath(icon)}
            alt={label}
            width={32}
            height={32}
            onError={(e) => {
              console.error(`Failed to load icon: ${icon}`);
              setIconError(true);
            }}
            style={{ objectFit: 'contain' }}
          />
        ) : (
          <ColoredIcon letter={label.charAt(0).toUpperCase()} />
        )}
      </div>
      <div
        style={{
          width: '80px',
          maxHeight: '40px',
          overflow: 'hidden',
          wordWrap: 'break-word',
          textAlign: 'center',
          color: 'white',
          textShadow: '1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black',
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          lineHeight: '1.2',
        }}
      >
        {label}
      </div>
    </div>
  );
};

export default Icon;