import React, { useEffect, useState } from 'react';

interface MediaPlayerProps {
    appName: string;
    videoUrl: string;
    title: string;
    description: string;
}

// Simple type declaration for YouTube player
declare global {
    interface Window {
        YT: any;
    }
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ appName, videoUrl, title, description }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isStopped, setIsStopped] = useState(true);
    const [videoInput, setVideoInput] = useState(videoUrl);
    const [youtubePlayer, setYoutubePlayer] = useState<any>(null);

    useEffect(() => {
        const loadYoutubeApi = async () => {
            if (window.YT) return; // API already loaded
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://www.youtube.com/iframe_api';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        };
        loadYoutubeApi().then(() => {
            const player = new window.YT.Player(appName, {
                videoId: videoInput.split('v=')[1]?.split('&')[0], // Extract video ID from URL
                events: {
                    onReady: () => {
                        setYoutubePlayer(player);
                    },
                },
            });
        });
        return () => {
            if (youtubePlayer) {
                youtubePlayer.stopVideo();
                youtubePlayer.destroy();
            }
        };
    }, [appName, videoInput, youtubePlayer]);
    const handlePlay = () => {
        if (youtubePlayer) {
            youtubePlayer.playVideo();
            setIsPlaying(true);
            setIsStopped(false);
        }
    };
    const handlePause = () => {
        if (youtubePlayer) {
            youtubePlayer.pauseVideo();
            setIsPlaying(false);
        }
    };
    const handleStop = () => {
        if (youtubePlayer) {
            youtubePlayer.stopVideo();
            setIsPlaying(false);
            setIsStopped(true);
        }
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVideoInput(e.target.value);
    };
    return (
        <div className="media-player">
            <div className="media-player-header">
                <div className="input-container">
                    <input type="text" value={videoInput} onChange={handleInputChange} placeholder="Enter video URL" />
                    <button onClick={() => setVideoInput(videoInput)}>Search</button>
                </div>
                <div className="video-controls">
                    <button onClick={handlePlay} disabled={isPlaying}>Play</button>
                    <button onClick={handlePause} disabled={!isPlaying}>Pause</button>
                    <button onClick={handleStop} disabled={isStopped}>Stop</button>
                    <button disabled={isStopped}>Rewind</button>
                    <button disabled={isStopped}>VolumeBar</button>
                </div>
            </div>
            <div className="video-container">
                <div id={appName} />
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
    );
};
export default MediaPlayer;