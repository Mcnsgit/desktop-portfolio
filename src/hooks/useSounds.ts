// src/hooks/useSounds.ts
import React, { createContext, useContext, useCallback, useEffect, useRef, ReactNode } from "react";

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

interface SoundContextType {
  playSound: (soundName: keyof Sounds) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

let GLOBAL_STARTUP_PLAYED = false;

const useSoundSystem = () => {
  const sounds = useRef<Partial<Sounds>>({});
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !initialized.current) {
      sounds.current = {
        startup: new Audio("/assets/sounds/windows-startup.mp3"),
        click: new Audio("/assets/sounds/short_click.mp3"),
        doubleClick: new Audio("/assets/sounds/double-click.mp3"),
        error: new Audio("/assets/sounds/error.mp3"),
        windowOpen: new Audio("/assets/sounds/windows-maximize.mp3"),
        windowClose: new Audio("/assets/sounds/windows-minimize.mp3"),
      };
      
      Object.values(sounds.current).forEach(sound => sound?.load());
      initialized.current = true;
    }
  }, []);

  const playSound = useCallback((soundName: keyof Sounds) => {
    if (soundName === "startup" && GLOBAL_STARTUP_PLAYED) {
      return;
    }

    const sound = sounds.current[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => console.error(`Error playing sound ${soundName}:`, error));
      if (soundName === "startup") {
        GLOBAL_STARTUP_PLAYED = true;
      }
    }
  }, []);

  return { playSound };
};

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const soundSystem = useSoundSystem();

  useEffect(() => {
    if (!GLOBAL_STARTUP_PLAYED) {
      soundSystem.playSound("startup");
    }
  }, [soundSystem]);

  return React.createElement(SoundContext.Provider, { value: soundSystem }, children);
};

export const useSounds = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSounds must be used within a SoundProvider");
  }
  return context;
};
