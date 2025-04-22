"use client"; // Add directive

import React, { useCallback, Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import CanvasLoader from "./Loader";
import OptimizedOrbitControls from "./OptimizedOrbitControls";
import PerformanceOptimizer from "./PerformanceOptimizer";
import { useRouter } from "next/navigation";
import { useSounds } from "@/hooks/useSounds";

// --- ComputerModel Component ---
// This renders the actual GLTF model and handles clicks
const ComputerModel = () => {
  const router = useRouter();
  const { playSound } = useSounds();
  // Load the GLTF model - ensure the path is correct relative to the public folder
  const computer = useGLTF("./desktop_pc/scene.gltf"); // Path relative to /public

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
      <hemisphereLight intensity={0.18} groundColor="black" /> {/* Adjusted intensity */}
      <spotLight
       position={[-20, 50, 10]}
       angle={0.12}
       penumbra={1.3}
       intensity={3}
       castShadow
       shadow-mapSize={1024}
       />
      <pointLight intensity={1} />
      <primitive
        object={computer.scene}
        scale={1.50} // Slightly smaller scale might fit better
        position={[0, -3.5, -1.5]} // Adjust Y position if needed
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
  
  return (
    <div className="w-full h-full pointer-events-auto"> {/* Allow pointer events on canvas container */}
      <Canvas
        frameloop="demand"
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [20, 3, 5], fov: 25 }} // Keep camera settings
        gl={{ preserveDrawingBuffer: false, antialias: true }}
      >
        <PerformanceOptimizer>
          <Suspense fallback={<CanvasLoader />}>
            <OptimizedOrbitControls
              enableZoom={false}
              maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} // Lock vertical
              enablePan={false}
              autoRotate={true} autoRotateSpeed={0.4} // Subtle rotation
              // enableDamping={true} dampingFactor={0.1}
            />
            <ComputerModel />
          </Suspense>
          <Preload all />
        </PerformanceOptimizer>
      </Canvas>
    </div>
  );
};

export default PortfolioComputer;
