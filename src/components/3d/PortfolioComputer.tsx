"use client"; // Add directive

import React, { useCallback, Suspense, useEffect,  useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {  Preload, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import CanvasLoader from "./Loader";
import OptimizedOrbitControls from "./OptimizedOrbitControls";
import PerformanceOptimizer from "./PerformanceOptimizer";
import { useRouter } from "next/navigation";
import { useSounds } from "@/hooks/useSounds";

// --- Scene Setup Component for Transparency ---
const SceneSetup = () => {
  const { scene, gl } = useThree();
  
  useEffect(() => {
    scene.background = null; // Make scene background transparent
    gl.setClearAlpha(0);    // Ensure the WebGLRenderer clear color has alpha 0
  }, [scene, gl]);
  
  return null;
};

// --- ComputerModel Component ---
// This renders the actual GLTF model and handles clicks
const ComputerModel = ({ isMobile }: { isMobile: boolean }) => {
  const computer = useGLTF("./desktop_pc/scene.gltf"); // Path relative to /public

  const router = useRouter();
  const { playSound } = useSounds();
  // Load the GLTF model - ensure the path is correct relative to the public folder

  // Click handler for navigation
  const handleClick = useCallback((event: React.MouseEvent) => { // Use React MouseEvent type
    event.stopPropagation(); // Stop propagation in the 3D scene
    playSound("click");
    console.log("Computer model clicked, navigating...");
    setTimeout(() => router.push("/desktop"), 100);
  }, [router, playSound]);

  // Optional: Effect to traverse and update materials if needed
  useEffect(() => {
    computer.scene?.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.needsUpdate = true;
        // Add other material adjustments if necessary
      }
    });
  }, [computer.scene]);

  return (
    // Add the onClick handler to the group containing the primitive
    <group onClick={handleClick} dispose={null}>
      <mesh>
        <hemisphereLight intensity={0.15} groundColor='black' />
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
          scale={isMobile ? 0.7 : 0.75}
          position={isMobile ? [0, -3, -2.2] : [0, -3.25, -1.5]}
          rotation={[-0.01, -0.2, -0.1]}
        />
        </mesh>
    </group>
  );
};
// --- End ComputerModel Component ---


// --- PortfolioComputer Component ---
// This sets up the Canvas environment for the model
const PortfolioComputer: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 500px");

    setIsMobile(mediaQuery.matches);

    const handleMediaQueryChange = (e: { matches: boolean | ((prevState: boolean) => boolean); }) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener("change",handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange)
    };
  }, []);
  
  return (
    <div className="w-full h-full pointer-events-auto"> {/* Allow pointer events on canvas container */}
      <Canvas
        frameloop="demand"
        shadows
        dpr={[1, 2]}
        camera={{ position: [20, 3, 5], fov: 25 }} // Keep camera settings
        gl={{ preserveDrawingBuffer: true, alpha: true }} // Added alpha: true for transparency
      >
        <SceneSetup /> {/* Add scene transparency setup */}
        <PerformanceOptimizer>
          <Suspense fallback={<CanvasLoader />}>
            <OptimizedOrbitControls
              enableZoom={false}
              maxPolarAngle={Math.PI / 2} 
              minPolarAngle={Math.PI / 2} // Lock vertical
          
            />
            <ComputerModel isMobile={isMobile} />
          </Suspense>
          <Preload all />
        </PerformanceOptimizer>
      </Canvas>
    </div>
  );
};

export default PortfolioComputer;
