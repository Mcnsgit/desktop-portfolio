"use client";
// pages/index.
import React, { Suspense, useState, useEffect, useCallback } from "react";

import CanvasLoader from "@/components/3d/Loader";
import StarsCanvas from "@/components/3d/canvas/Stars";
import { useRouter } from "next/navigation";
import BootAnimation from "../components/3d/BootAnimation";
import Navbar from "../components/cv/Navbar";
import Hero from "../components/cv/Hero";
import About from "../components/cv/About";
import Tech from "@/components/cv/Tech";
import Works from "@/components/cv/Works";
import { useSounds } from "@/hooks/useSounds";

import { DesktopProvider } from "@/context/DesktopContext";
import { FileSystemProvider } from "@/context/FileSystemContext";
import FontPreloader from "@/utils/FontPreloader";
import LoadingScreen from "@/components/3d/LoadingScreen";
import Experience from "@/components/cv/Experience"; // Import Experience
import Contact from "@/components/cv/Contact"; 
import PortfolioComputer from "@/components/3d/PortfolioComputer";
import { Canvas } from "@react-three/fiber";
import OptimizedOrbitControls from "@/components/3d/OptimizedOrbitControls";
import PerformanceOptimizer from "@/components/3d/PerformanceOptimizer";
import { Preload, useGLTF } from "@react-three/drei";
// Component to enable client-side rendering with error boundary
const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <>{children}</> : null;
};


const ComputerModel = () => {
  const router = useRouter();
  const { playSound } = useSounds();
  const computer = useGLTF("./desktop_pc/scene.gltf");

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      playSound("click");
      console.log("Computer clicked, navigating to desktop...");
      // Add a slight delay to ensure the click event is fully processed
      setTimeout(() => {
        router.push("/desktop");
      }, 100);
    },
    [router, playSound]
  );

  return (
    <group onClick={handleClick} dispose={null}>
      <hemisphereLight intensity={5} groundColor="black" />
      <spotLight
        position={[-20, 50, 10]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={1} />
      <primitive
        object={computer.scene}
        scale={0.75}
        position={[0, -3.25, -1.5]}
        rotation={[-0.01, -0.2, -0.1]}
      />
    </group>
  );
};


// Home page with 3D computer
export default function HomePage() {
  const [isBooting, setIsBooting] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { playSound } = useSounds();
  
  const [isLoading3D, setIsLoading3D] = useState(true);

  useEffect(() => {
    setIsClient(true); // Indicate client is ready
    if (typeof window !== "undefined") {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      if (process.env.NODE_ENV === 'development') setIsBooting(false); // Keep dev skip
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  const handleBootComplete = useCallback(() => { setIsBooting(false); playSound("startup"); }, [playSound]);
  const handle3DLoadComplete = useCallback(() => {
    setIsLoading3D(false);
  },[]);

  // Redirect mobile users immediately after client check
  useEffect(() => {
    if (isClient && isMobile) {
      router.push("/desktop");
    }
  }, [isClient, isMobile, router]);

  // --- Render Logic ---
  if (!isClient) {
    // Optional: Render a very basic static loader during SSR/initial hydration
    return <div>Loading...</div>;
  }

  if (isMobile) {
    // Render loading screen while redirecting
    return <LoadingScreen show={true} message="Loading Mobile Experience..." />;
  }

  if (isBooting) {
    return (<> <FontPreloader /> <BootAnimation onComplete={handleBootComplete} skipAnimation={isMobile} /> </>);
  }

  return (
    <DesktopProvider>
      <FileSystemProvider>
        <div className="relative z-0 bg-primary text-white min-h-screen"> {/* Ensure min height */}
          <FontPreloader />
          {isLoading3D && (
            <LoadingScreen
            show={isLoading3D}
            onComplete={handle3DLoadComplete}
            message="Loading 3D Environment..."
            delay={5000}
            />
          )}
          <StarsCanvas /> {/* Stars in the very back */}

          {/* Main Content Area */}
          <div className="relative z-10"
          style={{
            position: 'relative',
            width:'100%',
            height:'100vh',
            overflow: 'hidden',
          }}
          >
            
            <Navbar />
            <Hero />
            </div>

            {/* --- 3D Computer Model Section --- */}
            {/* Position this absolutely to overlay the hero visually */}
            {/* Adjust height/top/z-index as needed */}
            <div className="absolute top-0 left-0 w-full h-screen z-5 pointer-events-none"> {/* Cover screen, lower z-index than UI, allow clicks through */}
              <ClientOnly>
                <Canvas
                frameloop="demand"
                shadows
                camera={{ position: [20, 3, 5], fov: 25 }}
                gl={{
                  preserveDrawingBuffer: true,
                  powerPreference: "high-performance",
                  antialias: false, // Disable for better performance
                  depth: true, // Needed for 3D models
                }}
                dpr={[0.6, 1.5]} // Lower pixel ratio for better performance
                onCreated={({ gl }) => {
                  // Set pixel ratio to avoid performance issues on high-DPI screens
                  gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

                  // This will trigger when the Canvas is fully created
                  setTimeout(() => setIsLoading3D(false), 1000);
                }}
              >
                <PerformanceOptimizer>
                  <Suspense fallback={<CanvasLoader />}>
                    <OptimizedOrbitControls
                      enableZoom={true}
                      maxPolarAngle={Math.PI / 2}
                      minPolarAngle={Math.PI / 4}
                      enablePan={true}
                      autoRotate={false}
                      autoRotateSpeed={0.5}
                    />
                    <ComputerModel />
                  </Suspense>
                  <Preload all />
                </PerformanceOptimizer>
              </Canvas>
            </ClientOnly>
            <About />
            <Tech />

            <Experience />
            <Works />
            {/* <Feedbacks /> */}
            <Contact />
            {/* --- End CV Sections --- */}

          </div>

          {/* --- Desktop Prompt --- */}
          <div
            style={{
              position: "fixed", bottom: "20px", left: "50%",
              transform: "translateX(-50%)", color: "white", fontSize: "14px",
              backgroundColor: "rgba(0,0,0,0.7)", padding: "8px 15px", borderRadius: "5px",
              border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
              backdropFilter: "blur(5px)", animation: "pulse 2s infinite",
              cursor: "pointer", zIndex: 10 // Ensure above 3D canvas container
            }}
            onClick={() => router.push("/desktop")}
            title="Enter Retro Desktop Mode"
          >
            Click on the computer to enter desktop mode
          </div>
          {/* --- End Desktop Prompt --- */}

          {/* --- Pulse Animation --- */}
<style jsx>{`
  @keyframes pulse {
    0% {
      opacity: 0.7;
      transform: translateX(-50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translateX(-50%) scale(1.05);
    }
    100% {
      opacity: 0.7;
      transform: translateX(-50%) scale(1);
    }
  }
`}</style>
            
        </div>
      </FileSystemProvider>
    </DesktopProvider>
  );
}
//       {/* Desktop Mode Prompt (only on non-mobile) */}
//       {!isMobile && (
//         <div
//           style={{ /* ... prompt styles remain same ... */
//             position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)",
//             color: "white", fontSize: "14px", backgroundColor: "rgba(0,0,0,0.7)", padding: "8px 15px",
//             borderRadius: "5px", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
//             backdropFilter: "blur(5px)", animation: "pulse 2s infinite", cursor: "pointer", zIndex: 10 // Ensure above canvas
//           }}
//           onClick={() => router.push("/desktop")}
//           title="Enter Retro Desktop Mode"
//         >
//           Click on the computer to enter desktop mode
//         </div>
//       )}

//     </div>
//   );
// }
