// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import { IconName } from '../../../public/assets/icons';
// import Icon from './Icon'
// import styles from './DesktopShortcut.module.scss'
// import colors from '@/utils/constants/colors';
// export interface DesktopShortcutProps {
//     icon: IconName;
//     shortcutName: string;
//     invertText?: boolean;
//     onOpen: () => void;
// }

// const DesktopShortcut: React.FC<DesktopShortcutProps> = ({
//     icon,
//     shortcutName,
//     invertText,
//     onOpen,

// }) => {
//     const [isSelected, setIsSelected] = useState(false);
//     const [shortcutId, setShortcutId] = useState<string>('');
//     const [lastSelected, setLastSelected] = useState<boolean>(false);
//     const containerRef = useRef<HTMLDivElement>(null);

//     const [scaledStyle, setScaledStyle] = useState<{
//         transformOrigin?: string;
//         transform?: string;
//         left?: number;
//         top?: number;
//     }>({});

//     const requiredIcon = require(`../../assets/icons/${icon}.png`);
//     const [doubleClickTimerActive, setDoubleClickTimerActive] = useState(false);

//     const getShortcutId = useCallback(() => {
//         const shortcutId = shortcutName.replace(/\s/g, '');
//         return `desktop-shortcut-${shortcutId}`;
//     }, [shortcutName]);

//     useEffect(() => {
//         setShortcutId(getShortcutId());
//     }, [shortcutName, getShortcutId]);

//     useEffect(() => {
//         if (containerRef.current && Object.keys(scaledStyle).length === 0) {
//             const boundingBox = containerRef.current.getBoundingClientRect();
//             setScaledStyle({
//                 transformOrigin: 'center',
//                 transform: 'scale(1.5)',
//                 left: boundingBox.width / 4,
//                 top: boundingBox.height / 4,

//             });
//         }
//     }, [scaledStyle]);

//     const handleClickOutside = useCallback(
//         (event: MouseEvent) => {
//             // @ts-ignore
//             const targetId = event.target.id;
//             if (targetId !== shortcutId) {
//                 setIsSelected(false);
//             }
//             if (!isSelected && lastSelected) {
//                 setLastSelected(false);
//             }
//         },
//         [isSelected, setIsSelected, setLastSelected, lastSelected, shortcutId]
//     );

//     const handleClickShortcut = useCallback(() => {
//         if (doubleClickTimerActive) {
//             onOpen && onOpen();
//             setIsSelected(false);
//             setDoubleClickTimerActive(false);
//             return;
//         }
//         setIsSelected(true);
//         setLastSelected(true);
//         setDoubleClickTimerActive(true);
//         // set double click timer
//         setTimeout(() => {
//             setDoubleClickTimerActive(false);
//         }, 300);
//     }, [doubleClickTimerActive, setIsSelected, onOpen]);

//     useEffect(() => {
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [isSelected, handleClickOutside]);

//     return (
//         <div
//             id={`${shortcutId}`}
//             style={{ assign({ }, styles.appShortcut, scaledStyle) }}
//             onMouseDown={handleClickShortcut}
//             ref={containerRef}
//         >
//             <div id={`${shortcutId}`} style={styles.iconContainer}>
//                 <div
//                     id={`${shortcutId}`}
//                     className="desktop-shortcut-icon"
//                     style={Object.assign(
//                         {},
//                         styles.iconOverlay,
//                         isSelected && styles.checkerboard,
//                         isSelected && {
//                             WebkitMask: `url(${requiredIcon})`,
//                         }
//                     )}
//                 />
//                 <Icon icon={icon} style={styles.icon} />
//             </div>
//             <div
//                 className={
//                     isSelected
//                         ? 'selected-shortcut-border'
//                         : lastSelected
//                             ? 'shortcut-border'
//                             : ''
//                 }
//                 id={`${shortcutId}`}
//                 style={isSelected ? { backgroundColor: colors.colors.accent } : {}}
//             >
//                 <p
//                     id={`${shortcutId}`}
//                     style={Object.assign(
//                         {},
//                         styles.shortcutText,
//                         invertText && !isSelected && { color: 'black' }
//                     )}
//                 >
//                     {shortcutName}
//                 </p>
//             </div>
//         </div>
//     );
// };


// export default DesktopShortcut