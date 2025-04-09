// src/hooks/useSounds.ts
import { useCallback, useEffect, useRef } from "react";

interface Sounds {
  windowFocus: HTMLAudioElement;
  startup: HTMLAudioElement;
  click: HTMLAudioElement;
  doubleClick: HTMLAudioElement;
  error: HTMLAudioElement;
  windowOpen: HTMLAudioElement;
  windowClose: HTMLAudioElement;
  windowMinimize: HTMLAudioElement;
}

// Global variable to track if startup sound has been played
// This ensures it persists across component remounts
let GLOBAL_STARTUP_PLAYED = false;

export const useSounds = () => {
  const sounds = useRef<Partial<Sounds>>({});
  const initialized = useRef(false);
  const playingSound = useRef<string | null>(null); // Track currently playing sound

  useEffect(() => {
    if (!initialized.current) {
      sounds.current = {
        startup: new Audio("/sounds/windows-startup.mp3"),
        click: new Audio("/sounds/short_click.mp3"),
        doubleClick: new Audio("/sounds/double-click.mp3"),
        error: new Audio("/sounds/error.mp3"),
        windowOpen: new Audio("/sounds/windows-maximize.mp3"),
        windowClose: new Audio("/sounds/windows-minimize.mp3"),
      };

      // Add event listeners to track when sounds finish playing
      Object.entries(sounds.current).forEach(([name, sound]) => {
        if (sound) {
          sound.addEventListener("ended", () => {
            if (playingSound.current === name) {
              playingSound.current = null;
            }
          });
          sound.load();
        }
      });

      initialized.current = true;

      // Auto-play startup sound ONCE when hook initializes and it hasn't been played globally
      if (!GLOBAL_STARTUP_PLAYED) {
        console.log("Playing startup sound for the first time");
        const startupSound = sounds.current.startup;
        if (startupSound) {
          startupSound.play().catch(() => {
            // Ignore autoplay errors
          });
          GLOBAL_STARTUP_PLAYED = true;
        }
      }
    }
  }, []);

  const playSound = useCallback((soundName: keyof Sounds) => {
    // Don't play startup sound through normal playSound method after initial load
    if (soundName === "startup" && GLOBAL_STARTUP_PLAYED) {
      console.log("Skipping startup sound - already played");
      return;
    }

    // // Don't play a new sound if one is already playing (prevents overlapping)
    // if (playingSound.current) {
    //   console.log(
    //     `Sound already playing: ${playingSound.current}, skipping ${soundName}`
    //   );
    //   return;
    // }

    const sound = sounds.current[soundName];
    if (sound) {
      console.log(`Playing sound: ${soundName}`);
      sound.currentTime = 0;
      playingSound.current = soundName;

      sound.play().catch((error) => {
        console.error(`Error playing sound ${soundName}:`, error);
        playingSound.current = null;
      });

      // Mark startup as played if that's what we just played
      if (soundName === "startup") {
        GLOBAL_STARTUP_PLAYED = true;
      }
    }
  }, []);

  return { playSound };
};
