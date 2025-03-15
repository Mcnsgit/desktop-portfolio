import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import CanvasLoader from "./Loader";
import LoadingScreen from "./LoadingScreen";
import * as THREE from "three";
import { useDesktop } from "@/context/DesktopContext";
import { useSounds } from "@/hooks/useSounds";

interface ComputerModelProps {
  onZoomIn: () => void;
}

const ComputerModel: React.FC<ComputerModelProps> = ({ onZoomIn }) => {
  const computer = useGLTF("./desktop_pc/scene.gltf");
  const modelRef = useRef<THREE.Group>(null);
  const { playSound } = useSounds();

  const handleModelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound("click");
    onZoomIn();
  };

  return (
    <group ref={modelRef} onClick={handleModelClick} dispose={null}>
      <hemisphereLight intensity={0.15} groundColor="black" />
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

// Main component that manages the 3D view and transitions to desktop
const PortfolioComputer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches
  );
  const { state } = useDesktop();
  const { playSound } = useSounds();

  // Handle responsive layout
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaQueryChange = (e: MediaQueryListEvent) =>
      setIsMobile(e.matches);

    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () =>
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  const handleZoomIn = () => {
    setIsTransitioning(true);
    playSound("windowOpen");

    // Add a short delay before transitioning to allow sound to play
    setTimeout(() => {
      setIsZoomed(true);

      // Wait for transition to complete
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
    }, 300);
  };

  const handleZoomOut = () => {
    setIsTransitioning(true);
    playSound("windowClose");
    // Add a short delay before transitioning to allow sound to play
    setTimeout(() => {
      setIsZoomed(false);

      // Wait for transition to complete
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
    }, 300);
  };

  const handle3DLoadComplete = () => {
    setIsLoading(false);
  };

  const renderStartMenu = () => {
    // Import StartMenu dynamically to avoid circular dependencies
    const StartMenu = require("../desktop/StartMenu").default;

    if (state.startMenuOpen) {
      console.log("rendering StartMenu from PortfolioComputer");
      return <StartMenu />;
    }
    return null;
  };

  if (isMobile) {
    return <>{children}</>; // Return children directly for mobile
  }

  return (
    <div
      className="portfolio-computer"
      style={{ position: "relative", width: "100%", height: "100vh" }}
    >
      {isLoading && (
        <LoadingScreen
          show={isLoading}
          onComplete={handle3DLoadComplete}
          message="Loading 3D Environment..."
          delay={5000}
        />
      )}

      {isTransitioning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: "20px",
            fontFamily: "MS Sans Serif, Arial, sans-serif",
          }}
        >
          {isZoomed ? "Entering Desktop Mode..." : "Returning to 3D View..."}
        </div>
      )}

      {!isZoomed ? (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <Canvas
            frameloop="demand"
            shadows
            dpr={[1, 2]}
            camera={{ position: [20, 3, 5], fov: 25 }}
            gl={{ preserveDrawingBuffer: true }}
            onCreated={() => {
              // This will trigger when the Canvas is fully created
              setTimeout(() => setIsLoading(false), 1500);
            }}
          >
            <Suspense fallback={<CanvasLoader />}>
              <OrbitControls
                enableZoom={true}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 4}
                enablePan={true}
                autoRotate={true}
                autoRotateSpeed={0.5}
              />
              <ComputerModel onZoomIn={handleZoomIn} />
            </Suspense>
            <Preload all />
          </Canvas>

          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "15px 25px",
              borderRadius: "8px",
              fontFamily: "MS Sans Serif, Arial, sans-serif",
              fontSize: "16px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
              animation: "pulse 2s infinite",
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={handleZoomIn}
          >
            Click here or on the computer to enter desktop mode
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
      ) : (
        <div
          className="zoomed-interface"
          style={{ width: "100%", height: "100%", position: "relative" }}
        >
          <button
            onClick={handleZoomOut}
            className="back-button"
            aria-label="Back to 3D View"
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              zIndex: 1000,
              padding: "5px 10px",
              backgroundColor: "#c0c0c0",
              border: "2px solid",
              borderColor: "#dfdfdf #808080 #808080 #dfdfdf",
              fontFamily: "MS Sans Serif, sans-serif",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span style={{ fontSize: "14px" }}>🔙</span>
            Back to 3D View
          </button>
          {children}
          {/* Render StartMenu on top of everything */}
          {state.startMenuOpen && renderStartMenu()}
        </div>
      )}
    </div>
  );
};

export default PortfolioComputer;
