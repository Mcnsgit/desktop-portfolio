import React, { useState, useRef } from 'react';
import styles from './Icon.module.scss';
import Image from 'next/image';

interface IconProps {
    id: string;
    iconSrc: string;
    text: string;
    onDoubleClick: () => void;
    onPositionChange: (id: string, x: number, y: number) => void;
    x: number;
    y: number;
}

const Icon = ({ id, iconSrc, text, onDoubleClick, onPositionChange, x, y }: IconProps) => {
    const [isSelected, setIsSelected] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x, y });
    const dragStart = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const newX = position.x + (e.clientX - dragStart.current.x);
        const newY = position.y + (e.clientY - dragStart.current.y);
        setPosition({ x: newX, y: newY });
        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        onPositionChange(id, position.x, position.y);
    };


    const handleClickSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSelected(!isSelected);
    
    };

    return (
        <div
            className={`${styles.icon} ${isSelected ? styles.selected : ''}`}
            style={{ left: position.x, top: position.y }}
            onClick={handleClickSelect}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={onDoubleClick}
            onClick={handleClick}
            tabIndex={0}
        >
            <div className={styles.iconImageContainer}>
                <Image src={iconSrc} alt={text} width={32} height={32} />
            </div>
            <span className={styles.iconLabel}>{text}</span>
        </div>
    );
};

export default Icon;
