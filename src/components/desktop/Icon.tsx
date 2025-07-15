import React, { useState } from 'react';
import styles from './Icon.module.scss';
import Image from 'next/image';

interface IconProps {
    iconSrc: string;
    text: string;
    onDoubleClick: () => void;
}

const Icon = ({ iconSrc, text, onDoubleClick }: IconProps) => {
    const [isSelected, setIsSelected] = useState(false);

    return (
        <div
            className={`${styles.icon} ${isSelected ? styles.selected : ''}`}
            onClick={() => setIsSelected(true)}
            onBlur={() => setIsSelected(false)} // Deselect when clicking away
            onDoubleClick={onDoubleClick} // Use the passed handler
            tabIndex={0} // Make it focusable
        >
            <Image src={iconSrc} alt={text} width={32} height={32} />
            <span>{text}</span>
        </div>
    );
};


export default Icon;
