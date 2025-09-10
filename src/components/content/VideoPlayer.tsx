import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Stop, SpeakerSimpleHigh } from "@phosphor-icons/react";
import styles from './VideoPlayer.module.scss';

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

const DEFAULT_YOUTUBE_VIDEO_ID = 'WXuK6gekU1Y';
let ytApiLoaded: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
    if (ytApiLoaded) return ytApiLoaded;

    ytApiLoaded = new Promise((resolve, reject) => {
        if (window.YT && window.YT.Player) {
            return resolve();
        }
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        tag.onerror = (err) => reject(new Error("YouTube API script load failed"));
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            resolve();
        };
        setTimeout(() => reject(new Error("YouTube API load timeout")), 10000);
    });
    return ytApiLoaded;
}

function getYouTubeVideoId(urlOrId: string): string | null {
    if (!urlOrId) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
    const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11}).*/;
    const match = urlOrId.match(regExp);
    return (match && match[1]) ? match[1] : null;
}

export interface VideoPlayerProps {
    src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
    const [inputValue, setInputValue] = useState(src || '');
    const [videoId, setVideoId] = useState<string | null>(getYouTubeVideoId(src) || DEFAULT_YOUTUBE_VIDEO_ID);
    const [statusMessage, setStatusMessage] = useState('Loading GemPlayer...');
    const [isApiReady, setIsApiReady] = useState(false);
    const [playerState, setPlayerState] = useState(-1); // UNSTARTED
    const playerRef = useRef<YT.Player | null>(null);
    const playerDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setStatusMessage('Connecting to YouTube...');
        loadYouTubeApi()
            .then(() => {
                setStatusMessage('YouTube API Ready. Initializing player...');
                setIsApiReady(true);
            })
            .catch(err => setStatusMessage(`Error: ${err.message}`));
    }, []);

    useEffect(() => {
        if (!isApiReady || !playerDivRef.current || !videoId) return;

        if (playerRef.current) {
            playerRef.current.destroy();
        }

        setStatusMessage('Loading video...');
        try {
            playerRef.current = new window.YT.Player(playerDivRef.current, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1, 'autoplay': 1, 'controls': 0,
                    'modestbranding': 1, 'rel': 0, 'fs': 0,
                    'origin': window.location.origin
                },
                events: {
                    'onReady': () => setStatusMessage(''),
                    'onError': (event: any) => {
                        const errorMessages: { [key: number]: string } = {
                            2: "Invalid video ID.", 5: "HTML5 Player error.",
                            100: "Video not found/private.", 101: "Playback disallowed.",
                            150: "Playback disallowed."
                        };
                        setStatusMessage(errorMessages[event.data] || `Playback Error (Code: ${event.data})`);
                    },
                    'onStateChange': (event: any) => setPlayerState(event.data)
                }
            });
        } catch (error: any) {
            setStatusMessage(`Failed to create video player: ${error.message}`);
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [isApiReady, videoId]);

    const handleLoadVideo = () => {
        const newVideoId = getYouTubeVideoId(inputValue);
        if (newVideoId) {
            setVideoId(newVideoId);
        } else {
            setStatusMessage("Invalid YouTube URL or Video ID.");
        }
    };

    const isPlaying = playerState === window.YT?.PlayerState?.PLAYING || playerState === window.YT?.PlayerState?.BUFFERING;
    const isStopped = playerState === -1 || playerState === window.YT?.PlayerState?.ENDED || playerState === window.YT?.PlayerState?.CUED;

    return (
        <div className={styles.videoPlayer}>
            <div className={styles.urlBar}>
                <input
                    type="text"
                    className={styles.urlInput}
                    placeholder="Enter YouTube Video URL or ID"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo()}
                />
                <button className={styles.loadButton} onClick={handleLoadVideo}>Load</button>
            </div>
            <div className={styles.videoContainer}>
                {statusMessage ? (
                    <p className={styles.statusMessage}>{statusMessage}</p>
                ) : null}
                <div ref={playerDivRef} className={styles.playerFrame} style={{ display: statusMessage ? 'none' : 'block' }} />
            </div>
            <div className={styles.controlsPanel}>
                <div className={styles.buttonGroup}>
                    <button className={styles.controlButton} title="Play" disabled={isPlaying} onClick={() => playerRef.current?.playVideo()}>
                        <Play size={16} />
                    </button>
                    <button className={styles.controlButton} title="Pause" disabled={!isPlaying} onClick={() => playerRef.current?.pauseVideo()}>
                        <Pause size={16} />
                    </button>
                    <button className={styles.controlButton} title="Stop" disabled={isStopped} onClick={() => playerRef.current?.stopVideo()}>
                        <Stop size={16} />
                    </button>
                </div>
                <div className={styles.progressBarContainer}>
                    <div className={styles.progressBar} />
                </div>
                <div className={styles.volumeContainer}>
                    <span className={styles.volumeIcon}><SpeakerSimpleHigh size={16} /></span>
                    <div className={styles.volumeSlider} />
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;

