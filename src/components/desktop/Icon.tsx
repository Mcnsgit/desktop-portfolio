import React, { useState, useEffect } from 'react';
import styles from '../styles/Icon.module.scss';
import Image from 'next/image';

// Default icon paths that we know exist in the public folder
const DEFAULT_ICON = '/icons/default-icon.png'; // Create this default icon
const FALLBACK_ICONS = {
  'document': '/icons/win95/w98_message_file.ico', 
  'folder': '/icons/win98/w98_directory_open_file_mydocs.ico',
  'about': '/icons/win98/w98_address_book_pad_users.ico'
};

interface IconProps {
  icon: string;
  label: string;
  position: { x: number; y: number };
  onDoubleClick: () => void;
}

const Icon: React.FC<IconProps> = ({ icon, label, position, onDoubleClick }) => {
  const [selected, setSelected] = useState(false);
  const [iconSrc, setIconSrc] = useState<string>(icon);
  const [errorCount, setErrorCount] = useState(0);
  
  // Initialize icon source
  useEffect(() => {
    if (icon) {
      setIconSrc(icon);
      setErrorCount(0);
    }
  }, [icon]);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(true);
  };
  
  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = () => setSelected(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Advanced error handling with multiple fallbacks
  const handleImageError = () => {
    // Only try a limited number of fallbacks to avoid infinite loops
    if (errorCount > 2) return;
    
    setErrorCount(prev => prev + 1);
    
    // First fallback: Try to find a type-based fallback
    if (errorCount === 0) {
      // Check if this is a known icon type
      const iconLower = label.toLowerCase();
      if (iconLower.includes('document') || iconLower.includes('file')) {
        setIconSrc(FALLBACK_ICONS.document);
      } else if (iconLower.includes('folder') || iconLower.includes('directory')) {
        setIconSrc(FALLBACK_ICONS.folder);
      } else if (iconLower.includes('about')) {
        setIconSrc(FALLBACK_ICONS.about);
      } else {
        // Try converting .png to .ico if that's what caused the error
        if (iconSrc.toLowerCase().endsWith('.png')) {
          setIconSrc(iconSrc.replace(/\.png$/i, '.ico'));
        } else {
          // Skip to generic fallback
          setErrorCount(2);
        }
      }
    }
    // Second fallback: Use default icon
    else if (errorCount === 1 || errorCount === 2) {
      // Create a default-icon.png in your public folder
      // This should be a simple, reliable icon that definitely exists
      setIconSrc(DEFAULT_ICON);
      
      // If default icon fails, we'll use an inline SVG as last resort
      if (errorCount === 2) {
        console.warn(`Could not load any icon for ${label}, using inline SVG`);
      }
    }
  };
  
  return (
    <div 
      className={`${styles.icon} ${selected ? styles.selected : ''}`} 
      style={{ 
        left: position.x,
        top: position.y 
      }}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
    >
      <div className={styles.iconImage}>
        {errorCount > 2 ? (
          // Last resort: Inline SVG as fallback
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="7" width="24" height="18" rx="2" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
            <rect x="8" y="12" width="16" height="8" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
          </svg>
        ) : (
          <Image 
            src={iconSrc} 
            alt={label} 
            width={32} 
            height={32}
            unoptimized={iconSrc.endsWith('.ico')} 
            onError={handleImageError}
            priority={true}
          />
        )}
      </div>
      <div className={styles.iconLabel}>{label}</div>
    </div>
  );
};

export default Icon;