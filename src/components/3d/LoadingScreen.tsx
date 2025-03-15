import React, { useEffect, useState } from "react";
import styles from "../styles/LoadingScreen.module.scss";

interface LoadingScreenProps {
  message?: string;
  show: boolean;
  onComplete?: () => void;
  delay?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading application...",
  show,
  onComplete,
  delay = 3000,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) {
      setProgress(0);
      return;
    }

    // Reset progress when shown
    setProgress(0);

    // Simulate loading with increasing progress percentage
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Start slow, accelerate in the middle, then slow down toward the end
        let increment;
        if (prev < 20) increment = 0.5;
        else if (prev < 50) increment = 1;
        else if (prev < 80) increment = 0.8;
        else if (prev < 95) increment = 0.3;
        else increment = 0.1;

        const newValue = Math.min(prev + increment, 100);

        // If we reach 100%, trigger the onComplete callback after a delay
        if (newValue >= 100 && onComplete) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 500); // Small delay after reaching 100%
        }

        return newValue;
      });
    }, 50);

    // Force completion after max delay if specified
    const timeoutId = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
    }, delay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [show, onComplete, delay]);

  if (!show) return null;

  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContainer}>
        <div className={styles.windowHeader}>
          <div className={styles.windowTitle}>RetroOS</div>
          <div className={styles.windowControls}>
            <span className={styles.minimizeButton}></span>
            <span className={styles.maximizeButton}></span>
            <span className={styles.closeButton}></span>
          </div>
        </div>

        <div className={styles.loadingContent}>
          <div className={styles.loadingIcon}>
            <div className={styles.spinner}></div>
          </div>

          <div className={styles.loadingMessage}>{message}</div>

          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className={styles.progressText}>
            {Math.floor(progress)}% Complete
          </div>

          <div className={styles.loadingTip}>
            {getTip(Math.floor(progress / 20))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Random tips to display during loading
const getTip = (index: number): string => {
  const tips = [
    "Tip: Right-click on the desktop for additional options.",
    "Tip: You can drag windows by their title bars.",
    "Tip: Double-click icons to open programs.",
    "Tip: Use the Start menu to access all applications.",
    "Tip: Press F11 for fullscreen mode.",
    "Tip: The desktop background can be customized.",
  ];

  return tips[index % tips.length];
};

export default LoadingScreen;
