"use client"
// pages/index.tsx
import React, { useState, useEffect } from 'react';
import { useDesktop } from '../context/DesktopContext';
import Desktop from '../components/desktop/Desktop';
import MobileView from '../components/MobileView';
import PortfolioComputer from '@/components/3d/PortfolioComputer';
import StarsCanvas from '@/components/3d/canvas/Stars';
import projectsData from '../data/project';
import Head from 'next/head';
import BootAnimation from '../components/3d/BootAnimation';


const ProjectsInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { dispatch } = useDesktop();
  
  useEffect(() => {
    // Initialize projects on client-side only
    dispatch({ 
      type: 'INIT_PROJECTS', 
      payload: { projects: projectsData } 
    });
  }, [dispatch]);
  
  return <>{children}</>;
};
const Home: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const { dispatch } = useDesktop();
  
  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Only run on client side
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      // Initialize projects
      dispatch({ 
        type: 'INIT_PROJECTS', 
        payload: { projects: projectsData } 
      });
         // Skip boot animation for development
      if (process.env.NODE_ENV === 'development') {
        setIsBooting(false);
      } else {
        // Skip boot animation if the URL has a query parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('skipBoot')) {
          setIsBooting(false);
        }
      }
      
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, [dispatch]);
  
  // Handle boot animation completion
  const handleBootComplete = () => {
    setIsBooting(false);
  };
  
  return (
    <>
      <Head>
        <title>RetroOS Portfolio</title>
        <meta name="description" content="Web developer portfolio styled as a retro operating system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <ProjectsInitializer>
        {/* Boot animation */}
        {isBooting && (
          <BootAnimation onComplete={handleBootComplete} skipAnimation={isMobile} />
        )}
        
        {/* Main content */}
        {!isBooting && (
          <>
            {!isMobile && <StarsCanvas />}
            
            {isMobile ? (
              <MobileView />
            ) : (
              <PortfolioComputer>
                <Desktop />
              </PortfolioComputer>
            )}
          </>
        )}
      </ProjectsInitializer>
    </>
  );
};

export default Home;