"use client";

import React, {  useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import FontPreloader from "@/utils/FontPreloader";
import styles from './page.module.scss'; // Import the SCSS module

// CV Components
import Navbar from "@/components/cv/Navbar";
import Hero from "@/components/cv/Hero"; // Hero now includes the 3D Computer
import About from "@/components/cv/About";
import Tech from "@/components/cv/Tech";
import Works from "@/components/cv/Works";
import Experience from "@/components/cv/Experience";
import Contact from "@/components/cv/Contact";
// 3D & Utils
// import StarsCanvas from "@/components/3d/canvas/Stars";
import BootAnimation from "@/components/3d/BootAnimation";
import LoadingScreen from "@/components/3d/LoadingScreen";
import { useSounds } from "@/hooks/useSounds";
import './global.css';
// const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   return isClient ? <>{children}</> : null;
// };


// const ComputerModel = () => {
//   const router = useRouter();
//   const { playSound } = useSounds();
//   const computer = useGLTF("./desktop_pc/scene.gltf");

  // const handleClick = useCallback(
  //   (e: React.MouseEvent) => {
  //     e.stopPropagation();
  //     playSound("click");
  //     console.log("Computer clicked, navigating to desktop...");
  //     // Add a slight delay to ensure the click event is fully processed
  //     setTimeout(() => {
  //       router.push("/desktop");
  //     }, 100);
  //   },
  //   [router, playSound]
  // );
  // useEffect(() => {
  //   computer.scene?.traverse((child) => {
  //     if (child instanceof THREE.Mesh) {
  //       // Add specific material checks here if needed
  //       // e.g., if (child.material.name === 'ScreenMaterial') child.material.depthWrite = false;
  //       child.material.needsUpdate = true;
  //     }
  //   });
  // }, [computer.scene]);

//   return (
//     <group onClick={handleClick} dispose={null}>
//       <hemisphereLight intensity={1.5} groundColor="black" /> {/* Adjusted intensity */}
//       <spotLight position={[-20, 50, 10]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} />
//       <pointLight intensity={0.8} /> {/* Adjusted intensity */}
//       {/* Pass the scene object */}
//       <primitive object={computer.scene} scale={0.75} position={[0, -3.25, -1.5]} rotation={[-0.01, -0.2, -0.1]} />
//     </group>
//   );
// };


export default function HomePage() {
  const [isBooting, setIsBooting] = useState(process.env.NODE_ENV !== 'development'); // Default to true unless dev
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { playSound } = useSounds();

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    // Only set isBooting to false in dev mode *if* it was initially true
    // if (process.env.NODE_ENV === 'development' && isBooting) setIsBooting(false);
    return () => window.removeEventListener("resize", checkMobile);
  }, []); // Removed isBooting dependency

  const handleBootComplete = useCallback(() => { setIsBooting(false); playSound("startup"); }, [playSound]);

  // Mobile redirect logic
  useEffect(() => {
    // Redirect only when client-side, mobile detected, and boot is complete
    if (isClient && isMobile && !isBooting) {
      router.push("/desktop");
    }
  }, [isClient, isMobile, router, isBooting]);

  // Render Loading or Boot Animation
  if (!isClient) return <div className="bg-primary h-screen w-screen flex items-center justify-center text-white">Loading...</div>; // Basic SSR loader
  if (isMobile && !isBooting) return <LoadingScreen show={true} message="Loading Mobile Experience..." />; // Show loading during mobile redirect
  if (isBooting) return (<> <FontPreloader /> <BootAnimation onComplete={handleBootComplete} skipAnimation={isMobile} /> </>);

  // Render Main Desktop Page
  return (
    // Wrap with Providers if they aren't in a higher-level layout file
    // <DesktopProvider>
    //   <FileSystemProvider>
    <div className={`${styles.homePageContainer} relative z-0 bg-primary text-white min-h-screen`}> {/* Ensure background. bg-primary and text-white might be redundant if homePageContainer sets them via SCSS vars */}
      <FontPreloader />
      {/* <StarsCanvas /> Global background stars */}

      {/* Main Content Flow */}
      <div className={`${styles.contentLayer} relative z-10`}> {/* Content layer */}
        <div className={`${styles.heroSection} bg-hero-pattern bg-cover bg-no-repeat bg-center`}> {/* Tailwind classes for bg-hero-pattern are kept */}
                <Navbar />
        <Hero /> {/* Hero now contains the computer */}
        </div>
        <About />
        <Tech />
        <Experience />
        <Works />
        <Contact />
        {/* Add Footer component here if you have one */}
      </div>

      {/* Fixed Desktop Prompt (No longer needs mobile check here) */}
      <div
        className={`${styles.desktopEntryButton} fixed bottom-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg backdrop-blur-sm border border-white/20 bg-black/60 text-white text-sm cursor-pointer hover:bg-black/80 transition-colors z-50 animate-pulse`} // Tailwind classes kept, added module style for animation
        onClick={() => router.push("/desktop")}
        title="Enter Retro Desktop Mode"
        // style={{ animation: "pulse 2s infinite" }} // Removed inline style
      >
        Click computer to enter desktop
      </div>

      {/* Pulse Keyframes (can be in globals.css) */}
      {/* <style jsx global>{`
                        @keyframes pulse {
                          0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
                          50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
                        }
                    `}</style> */}
      {/* Removed style jsx block */}
    </div>
    //   </FileSystemProvider>
    // </DesktopProvider>
  );
}