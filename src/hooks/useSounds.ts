import { useCallback, useEffect, useRef } from "react";
interface Sounds {
  startup: HTMLAudioElement;
  click: HTMLAudioElement;
  error: HTMLAudioElement;
  windowOpen: HTMLAudioElement;
  windowClose: HTMLAudioElement;
}
export const useSounds = () => {
  const sounds = useRef<Partial<Sounds>>({});
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      sounds.current = {
        startup: new Audio("/sounds/windows-startup.mp3"), // Remove /public
        click: new Audio("/sounds/short_click.mp3"), // Remove /public
        error: new Audio("/sounds/error.mp3"), // Remove /public
        windowOpen: new Audio("/sounds/windows-maximize.mp3"), // Remove /public
        windowClose: new Audio("/sounds/windows-minimize.mp3"), // Remove /public
      };
      // Preload sounds
      Object.values(sounds.current).forEach((sound) => {
        sound.load();
      });
      initialized.current = true; // Mark as initialized
    }
  }, []);
  const playSound = useCallback((soundName: keyof Sounds) => {
    const sound = sounds.current[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Ignore playback errors (often due to autoplay restrictions)
      });
    }
  }, []);
  return { playSound };
};