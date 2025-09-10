import React, { useState, useRef, useEffect } from "react";
import { motion, Variants } from "framer-motion";

export interface MusicPlayerProps {
    src: String;
    title: string;
    subtitle: string;
    currentSong: String;
    setCurrentSong: React.Dispacth<React.SetStateAction<string>>;
}

const MusicPlayer: React.FC<MusicPlayerProps> = (props) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(new Audio(props.src));
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(1);

    useEffect(() => {
        audioRef.current.addEventListener('timeupdate', () => {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
            if (audioRef.current.currentTime === audioRef.current.duration) {
                setIsPlaying(false);
            }
        });
    }, []);
    const fastForward = () => {
        audioRef.current.currentTime += 15;
    };

    const fastRewind = () => {
        audioRef.current.currentTime = 0;
    };

    const togglePlay = () => {
        if (isPlaying) {
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            props.setCurrentSong(props.title);
        }
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
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time - minutes * 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    useEffect(() => {
        if (isPlaying) audioRef.current.play();
        else audioRef.current.pause();
    }, [isPlaying]);

    useEffect(() => {
        audioRef.current.currentTime = 0;
        return () => {

            audioRef.current.pause();
        };
    }, []);

    return (
        <div className="music-controller-container">
            <div>
                <motion.img
                    variants={ }
                    animate={isPlaying ? 'play' : 'pause'}
                    src={ }
                    onMouseDown={togglePlay}
                    alt=""
                />
            </div>
        </div>
    )
}
