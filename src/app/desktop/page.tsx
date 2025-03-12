"use client"
// app/desktop/age.tsx - without 3d model
import React, { useEffect, useState, useCallback } from 'react';
import { DesktopProvider } from '@/context/DesktopContext';
import Desktop from '@/components/desktop/Desktop';
import MobileView from '@/components/MobileView';
import projectsData from '@/data/project'; // Ensure this imports an array of projects
import Link from 'next/link';
import { useDesktop } from '@/context/DesktopContext'; // Importing context at the top

export default function DesktopPage() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const handleResize = useCallback(() => {
        const mobileView = window.innerWidth < 768;
        if (mobileView !== isMobile) {
            setIsMobile(mobileView);
        }
    }, [isMobile]);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    return (
        <DesktopProvider>
            <DesktopInitializer />
            <div className="desktop-container">
                {/* Back to 3D View Button */}
                <Link href="/" passHref>
                    <button
                        className="back-button"
                        aria-label="Back to 3D View"
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            zIndex: 1000,
                            padding: '5px 10px',
                            backgroundColor: '#c0c0c0',
                            border: '2px solid',
                            borderColor: '#dfdfdf #808080 #808080 #dfdfdf',
                            fontFamily: 'MS Sans Serif, sans-serif',
                            fontSize: '12px',
                            cursor: 'pointer',
                        }}
                    >
                        Back to 3D View
                    </button>
                </Link>
                {isMobile ? <MobileView /> : <Desktop />}
            </div>
        </DesktopProvider>
    );
}

// Component to initialize projects
const DesktopInitializer = () => {
    const { dispatch } = useDesktop(); // Using a custom hook for better readability
    useEffect(() => {
        console.log("Initializing projects with data:", projectsData);
        if (projectsData && projectsData.length > 0) {
            dispatch({
                type: 'INIT_PROJECTS',
                payload: { projects: projectsData }
            });
        } else {
            console.error("No projects data available or invalid format");
            // Provide fallback project
            dispatch({
                type: 'INIT_PROJECTS',
                payload: {
                    projects: [
                        {
                            id: 'about',
                            title: 'About Me',
                            icon: '/icons/about.png',
                            description: 'About the developer',
                            type: 'visual',
                            technologies: ['html', 'css', 'javascript'],
                            content: 'About Me content goes here'
                        }
                    ]
                }
            });
        }
    }, [dispatch]);
    return null;
};
