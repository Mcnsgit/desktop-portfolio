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
  const [text, setText] = useState<string[]>([]);
  const { playSound } = useSounds();

  // Old‑style BIOS boot sequence only (no RetroOS loading bar here)
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
      // Final delay before handing control back to the app
      { delay: 2000, message: null },
    ];

    const timeouts: NodeJS.Timeout[] = [];
    let elapsed = 0;

    bootSequence.forEach((item, index) => {
      const timeoutId = setTimeout(() => {
        if (item.message) {
          setText((prev) => [...prev, item.message]);
        }

        if (index === bootSequence.length - 1) {
          onComplete();
        }
      }, elapsed);

      timeouts.push(timeoutId);
      elapsed += item.delay;
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [onComplete, skipAnimation, playSound]);

  if (skipAnimation) {
    return null;
  }

  return (
    <div className={styles.bootAnimation}>
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
    </div>
  );
};

export default BootAnimation;
