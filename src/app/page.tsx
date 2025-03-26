"use client";
// pages/index.
import React, { Suspense, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
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
import OptimizedOrbitControls from "@/components/3d/OptimizedOrbitControls";
import PerformanceOptimizer from "@/components/3d/PerformanceOptimizer";
import FontPreloader from "@/utils/FontPreloader";
import LoadingScreen from "@/components/3d/LoadingScreen";

// Component to enable client-side rendering with error boundary
const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <>{children}</> : null;
};

// Computer model that navigates to desktop when clicked
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
  const [isBooting, setIsBooting] = useState(true);
  const [isLoading3D, setIsLoading3D] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { playSound } = useSounds();

  // Check for mobile devices
  useEffect(() => {
    // Detect mobile only on client-side to prevent hydration mismatch
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener("resize", handleResize);

      // Skip boot animation in development
      if (process.env.NODE_ENV === "development") {
        setIsBooting(false);
      }

      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
    playSound("startup");
  }, [playSound]);

  const handle3DLoadComplete = useCallback(() => {
    setIsLoading3D(false);
    playSound("windowOpen");
  }, [playSound]);

  // On mobile, go straight to desktop
  useEffect(() => {
    if (isMobile) {
      router.push("/desktop");
    }
  }, [isMobile, router]);

  if (isBooting) {
    return (
      <>
        <FontPreloader />
        <BootAnimation
          onComplete={handleBootComplete}
          skipAnimation={isMobile}
        />
      </>
    );
  }

  return (
    <div className="relative z-0 bg-primary">
      <FontPreloader />

      {isLoading3D && (
        <LoadingScreen
          show={isLoading3D}
          onComplete={handle3DLoadComplete}
          message="Loading 3D Environment..."
          delay={5000}
        />
      )}

      <StarsCanvas />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Navbar />
        <Hero />
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
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
        <Works />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          fontSize: "16px",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: "12px 20px",
          borderRadius: "5px",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
          backdropFilter: "blur(5px)",
          animation: "pulse 2s infinite",
          cursor: "pointer",
        }}
        onClick={() => router.push("/desktop")}
      >
        Click on the computer to enter desktop mode
      </div>

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
  );
}
