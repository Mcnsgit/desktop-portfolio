import React, { useRef, useEffect } from 'react';
import styles from './Window.module.scss';
import { WindowProps } from '../../types/window';
import Draggable from 'react-draggable';

interface InteractiveWindowProps extends WindowProps {
    onClose: () => void;
    onMinimize: () => void;
    onMaximize: () => void;
    onFocus: () => void;
    onDragStop: (x: number, y: number) => void;
    ariaLabelledBy?: string;
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
    ariaLabelledBy
}: InteractiveWindowProps) => {
    const nodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isActive && nodeRef.current) {
            const focusableElements = nodeRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length > 0) {
                (focusableElements[0] as HTMLElement).focus();
            }

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Tab') {
                    const firstElement = focusableElements[0] as HTMLElement;
                    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            };

            nodeRef.current.addEventListener('keydown', handleKeyDown);
            return () => {
                nodeRef.current?.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isActive]);

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
        nodeRef={nodeRef as React.RefObject<HTMLElement>}
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
            aria-labelledby={ariaLabelledBy}
            >
                    <div className={`${styles.titleBar} title-bar-handle-${id}`}>
                        <span id={ariaLabelledBy}>{title}</span>
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

