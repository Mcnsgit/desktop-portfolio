//components/windows/windowTypes/SettingsWindow.tsx// src/components/windows/WindowTypes/SettingsWindow.tsx
import React, { useState } from 'react';
import styles from './SettingsWindow.module.scss';
// import { useDesktop } from "../../../context/DesktopContext";
import { useSounds } from "@/hooks/useSounds";
import Image from "next/image";

interface SettingsWindowProps {
    // No specific props needed at this time
}

const SettingsWindow: React.FC<SettingsWindowProps> = () => {
    // const { state, dispatch } = useDesktop();
    const { playSound} = useSounds();
    const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'sound'>('general');
    const [backgroundIndex, setBackgroundIndex] = useState<number>(0);

    // Background options
    const backgrounds = [
        "/backgrounds/retro_background_1.jpeg",
        "/backgrounds/retro_background_2.jpeg",
        "/backgrounds/retro_background_3.jpeg",
    ];

    const handleBackgroundChange = (index: number) => {
        setBackgroundIndex(index);
        // Here you would dispatch an action to update the background
        // dispatch({ type: "CHANGE_WALLPAPER", payload: { wallpaper: backgrounds[index] } });
        playSound("click");
    };

    // const handleSoundToggle = () => {
    //     playSound("click");
    // };

    // const handleChangeTheme = (theme: string) => {
    //     dispatch({ type: "RESTORE_WINDOW", payload: { id: "settings" } });
    //     playSound("click");
    // };

    return (
        <div className={styles.settingsWindow}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'general' ? styles.active : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    General
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'appearance' ? styles.active : ''}`}
                    onClick={() => setActiveTab('appearance')}
                >
                    Appearance
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'sound' ? styles.active : ''}`}
                    onClick={() => setActiveTab('sound')}
                >
                    Sound
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'general' && (
                    <div className={styles.generalSettings}>
                        <h3>General Settings</h3>
                        <div className={styles.settingGroup}>
                            <label>
                                <input type="checkbox" defaultChecked /> Enable tooltips
                            </label>
                        </div>
                        <div className={styles.settingGroup}>
                            <label>
                                <input type="checkbox" defaultChecked /> Show desktop icons
                            </label>
                        </div>
                        <div className={styles.settingGroup}>
                            <label>
                                <input type="checkbox" /> Enable auto-save
                            </label>
                        </div>
                        <div className={styles.infoBox}>
                            <h4>System Information</h4>
                            <p>RetroOS Portfolio Version: 1.0.0</p>
                            <p>Framework: Next.js with React</p>
                            <p>Last Updated: April 2025</p>
                        </div>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div className={styles.appearanceSettings}>
                        <h3>Appearance Settings</h3>
                        <div className={styles.settingGroup}>
                            {/* <label>Desktop Theme:</label>
                            <select onChange={(e) => handleChangeTheme(e.target.value)} defaultValue="win98">
                                <option value="win98">Windows 98</option>
                                <option value="winxp">Windows XP</option>
                                <option value="modern">Modern</option>
                            </select> */}
                        </div>
                        <div className={styles.settingGroup}>
                            <label>Desktop Background:</label>
                            <div className={styles.backgroundOptions}>
                                {backgrounds.map((bg, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.backgroundOption} ${backgroundIndex === index ? styles.selected : ''}`}
                                        onClick={() => handleBackgroundChange(index)}
                                    >
                                        <div className={styles.backgroundPreview}>
                                            <Image
                                                src={bg}
                                                alt={`Background ${index + 1}`}
                                                width={160}
                                                height={100}
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <span>Background {index + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.settingGroup}>
                            <label>
                                <input type="checkbox" defaultChecked /> Show window shadows
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'sound' && (
                    <div className={styles.soundSettings}>
                        <h3>Sound Settings</h3>
                        <div className={styles.settingGroup}>

                        </div>
                        <div className={styles.settingGroup}>
                            <label>System Volume:</label>
                            <input type="range" min="0" max="100" defaultValue="75" />
                        </div>
                        <div className={styles.soundList}>
                            <h4>Sound Events</h4>
                            <table className={styles.soundTable}>
                                <tbody>
                                    <tr>
                                        <td>Window Open</td>
                                        <td>
                                            <button className={styles.playSound} onClick={() => playSound("windowOpen")}>
                                                Test
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Window Close</td>
                                        <td>
                                            <button className={styles.playSound} onClick={() => playSound("windowClose")}>
                                                Test
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Button Click</td>
                                        <td>
                                            <button className={styles.playSound} onClick={() => playSound("click")}>
                                                Test
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Error</td>
                                        <td>
                                            <button className={styles.playSound} onClick={() => playSound("error")}>
                                                Test
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsWindow;