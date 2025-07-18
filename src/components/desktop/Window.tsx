import React, { useRef } from 'react';
import styles from './Window.module.scss';
import { WindowProps } from '../../types/window';
import Draggable from 'react-draggable';

interface InteractiveWindowProps extends WindowProps {
    onClose: () => void;
    onMinimize: () => void;
    onMaximize: () => void;
    onFocus: () => void;
    onDragStop: (x: number, y: number) => void;
}


const Window = ({ 
    id,
    title,
    content,
    x,
    y,
    w,
    h,
    isActive,
    isMinimized,
    isMaximized,
    onClose,
    onMinimize,
    onMaximize,
    onFocus,
    onDragStop,
}: InteractiveWindowProps) => {
    const nodeRef = useRef<HTMLDivElement>(null);
    if (isMinimized) {
        return null;
    }

    const windowClasses = `
        ${styles.window}
        ${isActive ? styles.active : ''}
        ${isMaximized ? styles.maximized : ''}
    `;


    return (
        <Draggable
        nodeRef={nodeRef}
        handle={`.title-bar-handle-${id}`}
        position={{ x, y }}
        onStop={(_e, data) => onDragStop(data.x, data.y)}    
        onStart={onFocus}
        disabled={isMaximized}
        >
            <div
            ref={nodeRef} 
            className={windowClasses}
            onMouseDown={onFocus}
            style={{ 
                width: w, 
                height: h,
                zIndex: isActive ? 10 : 1 
            }}
            >
                    <div className={`${styles.titleBar} title-bar-handle-${id}`}>
                        <span>{title}</span>
                        <button onClick={onMinimize} aria-label="Minimize" className={styles.minimizeButton}>-</button>
                        <button onClick={onMaximize} aria-label="Maximize" className={styles.maximizeButton}>+</button>
                        <button onClick={onClose} aria-label="Close" className={styles.closeButton}>X</button>
                    </div>
                        <div className={styles.content}>
                        {content}
                    </div>
                        </div>
            </Draggable>
    );
};

export default React.memo(Window);

