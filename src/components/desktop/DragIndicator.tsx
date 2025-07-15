import React from 'react';
import styles from './DragIndicator.module.scss';
interface DragIndicatorProps {
    position: { x: number; y: number };
    size: { width: number; height: number };
}

const DragIndicator: React.FC<DragIndicatorProps> = ({ position, size }) => {
    return (
        <div
            className={styles.dragIndicator}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                width: size.width,
                height: size.height,
            }}
        />
    );
};

export default DragIndicator;