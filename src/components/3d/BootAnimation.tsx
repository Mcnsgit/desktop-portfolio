import React, { useState, useEffect } from "react";
import styles from "../styles/BootAnimation.module.scss";
import { useSounds } from "@/hooks/useSounds";

interface BootAnimationProps {
  onComplete: () => void;
  skipAnimation?: boolean;
}

const BootAnimation: React.FC<BootAnimationProps> = ({
  onComplete,
  skipAnimation = false,
}) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState<string[]>([]);
  const { playSound } = useSounds();

  // Boot sequence
  useEffect(() => {
    if (skipAnimation) {
      onComplete();
      return;
    }

    playSound("startup");

    const bootSequence = [
      { delay: 500, message: "Initializing system..." },
      { delay: 1000, message: "Checking hardware configuration..." },
      { delay: 1200, message: "CPU: Intel 486DX 66MHz - OK" },
      { delay: 800, message: "Memory: 8MB RAM - OK" },
      { delay: 1000, message: "Hard Disk: 540MB - OK" },
      { delay: 1200, message: "Video: VGA 640x480 - OK" },
      { delay: 1000, message: "Sound: Sound Blaster 16 - OK" },
      { delay: 1500, message: "Loading RetroOS..." },
      { delay: 3000, message: null }, // No message for progress step
      { delay: 5000, message: null }, // Final step
    ];

    let timeoutId: NodeJS.Timeout;
    let elapsed = 0;

    bootSequence.forEach((item, index) => {
      timeoutId = setTimeout(() => {
        if (item.message) {
          setText((prev) => [...prev, item.message]);
        } else if (index === bootSequence.length - 2) {
          setStep(1); // Move to progress step
        } else if (index === bootSequence.length - 1) {
          onComplete();
        }
      }, elapsed);
      elapsed += item.delay;
    });

    const progressInterval = setInterval(() => {
      setProgress((prev) => (step === 1 && prev < 100 ? prev + 1 : prev));
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
    };
  }, [onComplete, skipAnimation, step, playSound]);

  if (skipAnimation) {
    return null;
  }

  return (
    <div className={styles.bootAnimation}>
      {step === 0 && (
        <div className={styles.bootScreen}>
          <div className={styles.biosHeader}>
            RetroOS BIOS v1.0
            <span>Copyright © {new Date().getFullYear()}</span>
          </div>
          <div className={styles.biosContent}>
            {text.map((line, index) => (
              <div key={index} className={styles.textLine}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className={styles.bootProgress}>
          <div className={styles.logo}>RetroOS</div>
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.loadingText}>Loading... {progress}%</div>
        </div>
      )}
    </div>
  );
};

export default BootAnimation;
