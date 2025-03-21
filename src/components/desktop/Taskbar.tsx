// components/desktop/Taskbar.tsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { useDesktop } from '../../context/DesktopContext';
import { useSounds } from '../../hooks/useSounds';
import styles from '../styles/Taskbar.module.scss';

interface TaskbarProps {
  onStartClick: () => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ onStartClick }) => {
  const { state, dispatch } = useDesktop();
  const { playSound } = useSounds();
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  // Update clock - client-side only
  useEffect(() => {
    // Update immediately and then set interval
    const updateTime = () => {
      const now = new Date();
      // Use 24-hour format to ensure consistency
      const timeString = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Force 24-hour format
      });
      setCurrentTime(timeString);
    };

    updateTime(); // Update immediately
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle taskbar window button click
  const handleWindowClick = (windowId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation
    playSound('click');
    dispatch({ type: 'FOCUS_WINDOW', payload: { id: windowId } });
  };

  // Handle Start button click with explicit propagation prevention
  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling to desktop
    e.preventDefault(); // Prevent default behavior
    console.log("Start button clicked"); // Debug log

    // Just to be sure the start menu toggle works
    playSound('click');
    onStartClick();
  };

  return (
    <div className={styles.taskbar} onClick={(e) => e.stopPropagation()}>
      <div
        className={styles.startButton}
        onClick={handleStartClick}
      >
        Start
      </div>

      <div className={styles.windowButtons}>
        {state.windows.map(window => (
          <div
            key={window.id}
            className={`${styles.windowButton} ${state.activeWindowId === window.id ? styles.active : ''}`}
            onClick={(e) => handleWindowClick(window.id, e)}
          >
            <FontAwesomeIcon icon={faWindowRestore} />
            <span>{window.title}</span>
          </div>
        ))}
      </div>

      <div className={styles.systemTray}>
        {/* Only render the time if it's available (client-side) */}
        <div className={styles.clock}>
          {currentTime}
        </div>
      </div>
    </div>
  );
};

export default Taskbar;