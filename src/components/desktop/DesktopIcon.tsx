import React, { useState, useCallback, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { DesktopIcon as DesktopIconType } from '../../types/index';
import styles from './Icon.module.scss';

interface DesktopIconProps {
    icon: DesktopIconType;
    onDoubleClick: (icon: DesktopIconType) => void;
    onSelect: (icon: DesktopIconType) => void;
    isSelected: boolean; 
}

const DesktopIcon: React.FC<DesktopIconProps> = ({
    icon,
    onDoubleClick,
    onSelect,
    isSelected
}) => {
    const [iconError, setIconError] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: icon.id,
        data: {
            id: icon.id,
            label: icon.label,
            type: icon.type,
            originalPosition: icon.position,
        },
    });

    // Transform style with proper positioning
    const style = transform ? {
        transform: CSS.Translate.toString(transform),
        position: 'absolute' as const,
        left: icon.position.x,
        top: icon.position.y,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : undefined,
        cursor: isDragging ? 'grabbing' : 'pointer',
        width: "80px",
        height: "90px",
    } : {
        position: 'absolute' as const,
        left: icon.position.x,
        top: icon.position.y,
        cursor: 'pointer',
        width: "80px",
        height: "90px",
    };

    // Fix icon path (similar to existing Icon component)
    const fixIconPath = (pathInput: string): string => {
        let path = pathInput;
        if (!path) return '/assets/win98-icons/png/directory_open_cool-2.png';
        if (!path.startsWith('/') && !path.startsWith('http')) {
            path = `/${path}`;
        }
        path = path.replace('/assets/icons/win98/png/', '/assets/win98-icons/png/');
        const hasExtension = /\.(png|ico|jpg|jpeg|svg|webp)$/i.test(path);
        if (!hasExtension && !path.includes('data:image')) {
            path = `${path}.png`;
        }
        return path;
    };

    const finalIconSrc = fixIconPath(icon.icon);

    // Fallback icon component
    const FallbackIcon = () => (
        <div className={styles.fallbackIcon}>
            {icon.type === 'folder' ? '📁' : icon.label.charAt(0).toUpperCase()}
        </div>
    );

    // Handle click with double-click detection
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDragging) return;

        setClickCount(prev => prev + 1);

        if (clickTimer) {
            clearTimeout(clickTimer);
        }

        const timer = setTimeout(() => {
            if (clickCount === 0) {
                // Single click - select
                onSelect(icon);
            }
            setClickCount(0);
        }, 300); // Double-click timeout

        setClickTimer(timer);
    }, [clickCount, clickTimer, isDragging, onSelect, icon]);

    // Handle double click
    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDragging) return;

        if (clickTimer) {
            clearTimeout(clickTimer);
            setClickTimer(null);
        }
        setClickCount(0);
        
        // Execute double-click action
        onDoubleClick(icon);
    }, [isDragging, clickTimer, onDoubleClick, icon]);

    return (
        <div 
            ref={setNodeRef}
            style={style}
            className={`${styles.icon} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''}`}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            {...listeners}
            {...attributes}
            data-item-id={icon.id}
            data-item-type={icon.type}
        >        
            <div className={styles.iconImageContainer}>
                {!iconError && finalIconSrc ? (
                    <Image
                        src={finalIconSrc}
                        alt={icon.label}
                        width={32}
                        height={32}
                        onError={() => {
                            console.warn(`Using fallback for icon: ${finalIconSrc}`);
                            setIconError(true);
                        }}
                        style={{ objectFit: "contain" }}
                        unoptimized
                        loading="eager"
                    />
                ) : (
                    <FallbackIcon />
                )}
            </div>
            <div className={styles.iconLabel}>{icon.label}</div>
        </div>
    );
};

export default DesktopIcon;
