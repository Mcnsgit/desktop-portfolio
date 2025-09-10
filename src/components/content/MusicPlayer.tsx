import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, FastForward, Rewind } from "@phosphor-icons/react";
import styles from "./MusicPlayer.module.scss";

export interface MusicPlayerProps {
  src: string;
  title: string;
  subtitle: string;
  currentSong: string;
  setCurrentSong: React.Dispatch<React.SetStateAction<string>>;
}

const MusicPlayer: React.FC<MusicPlayerProps> = (props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio(props.src));
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    
    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    }

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.currentTime === audio.duration) {
        setIsPlaying(false);
      }
    }

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
    };
  }, []);

  const fastForward = () => {
    audioRef.current.currentTime += 15;
  };

  const fastRewind = () => {
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      props.setCurrentSong(props.title);
    }
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
    audioRef.current.currentTime = Number(e.target.value);
  };

  useEffect(() => {
    if (props.currentSong === props.title) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [props.currentSong, props.title]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    if (isPlaying) audioRef.current.play();
    else audioRef.current.pause();
  }, [isPlaying]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      audioRef.current.pause();
    };
  }, []);

  return (
    <div className={styles.musicPlayer}>
      <div className={styles.songDetails}>
        <h3>{props.title}</h3>
        <p>{props.subtitle}</p>
      </div>
      <div className={styles.timeControls}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <input
        type="range"
        className={styles.progressBar}
        value={currentTime}
        max={duration}
        onChange={handleProgressChange}
      />
      <div className={styles.controls}>
        <button className={styles.controlButton} onClick={fastRewind} title="Rewind 15s">
          <Rewind size={24} />
        </button>
        <button className={styles.controlButton} onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button className={styles.controlButton} onClick={fastForward} title="Forward 15s">
          <FastForward size={24} />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;
