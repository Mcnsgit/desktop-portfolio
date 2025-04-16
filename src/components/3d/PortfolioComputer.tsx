import React, { useCallback, Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame , useThree } from "@react-three/fiber";
import { Group } from "three"

import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import CanvasLoader from "./Loader";
import LoadingScreen from "./LoadingScreen";
import * as THREE from "three";
import OptimizedOrbitControls from "./OptimizedOrbitControls"; 
import PerformanceOptimizer from "./PerformanceOptimizer"; 
import { useRouter } from "next/navigation"; 
import { useDesktop } from "@/context/DesktopContext";
import { useSounds } from "@/hooks/useSounds";

interface ComputerModelProps {
  onLoaded?: () => void;
  onClick?: (e: React.MouseEvent) => void;
  onZoomIn: () => void;
  isMobile?: boolean;
}

const ComputerModel: React.FC<ComputerModelProps> = ({ onZoomIn,
  onLoaded,
  onClick,
  isMobile = false,
 }) => {
  const computer = useGLTF("./desktop_pc/scene.gltf");
  const modelRef = useRef<THREE.Group>(null);

  const { camera } = useThree();
  const [isLoaded, setIsLoaded] = useState(false);
  const groupRef = useRef<Group>(null);

  //load model with proper error handling
  const {scene, nodes, materials } = useGLTF("./desktop_pc/scene.gltf", true,
    undefined,
    (error) => console.error("error loading 3d model:", error)
  );

  //progressive model optimisation
  useEffect(() => {
    if (scene) {
      //apply optimisations to the scene
      scene.traverse((child: any) => {
        //diable frustun culling for important objects 
        if (child.isMesh) {
          //enable frustum culling for better performance
          child.frustumCulled =true;

          //lower res for materials if on mobile
          if (isMobile && child.material) {
            if (child.material.map) {
              child.material.map.anisotropy = 1;
              child.material.map.minFIilter = THREE.LinearFilter;
            }
            child.material.percision = isMobile ? 'lowp' : 'highp';
            child.geometry.attributes.uv2 && child.geometry.deleteAttributes('uv2');
          }
        }
      });

      //signal that model is laoded and optimised 
      setTimeout(() =>{ 
        setIsLoaded(true);
        onLoaded?.();
      },100);
    }
  }, [scene, isMobile, onLoaded]);

  //optimisse animations based on visibilty and performance 
  useFrame(({clock, camera}) => {
    if (!groupRef.current) return;

    const mesh = groupRef.current;

    //skip animation updated if model is far from camera or out of view 
    const distance  = camera.position.distanceTo(mesh.position);
    if (distance > 50 ) return;

    //simple bvreathing animation
    const t = clock.getElapsedTime();
    mesh.rotation.y = Math.sin(t / 4) *0.05;
  });

  const { playSound } = useSounds();

  const handleModelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound("click");
    onZoomIn();
  };

  return (
    // Pass onClick handler to the group
    <group ref={groupRef} onClick={onClick} dispose={null} visible={isLoaded}>
      <hemisphereLight intensity={isMobile ? 2 : 3.5} groundColor="black" /> {/* Adjusted intensity */}
      <spotLight
        position={[-20, 50, 10]} angle={0.12} penumbra={1}
        intensity={1} castShadow shadow-mapSize={1024}
      />
      <pointLight intensity={1.2} /> {/* Slightly brighter point light */}
      <primitive
        object={scene}
        // *** ADJUST SCALE/POSITION if model appears too large/small/offset ***
        scale={isMobile ? 0.6 : 0.7} // Slightly smaller scale
        position={isMobile ? [0, -3, -1.8] : [0, -3.1, -1.5]} // Adjusted position
        rotation={[-0.01, -0.2, -0.1]}
      />
    </group>
  );
};


// PortfolioComputer Wrapper Component
const PortfolioComputer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const { playSound } = useSounds();
  const router = useRouter();

  // Simplified mobile check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile); // Use resize instead of change
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Click handler to navigate
  const handleComputerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    playSound("click");
    router.push('/desktop');
  }, [playSound, router]);

  // Don't render anything on mobile here
  if (isMobile) return null;

  return (
    // Ensure this div allows the Canvas to size correctly
    <div className="portfolio-computer w-full h-full relative pointer-events-auto"> {/* Enable pointer events on container */}
      <Canvas
        frameloop="demand" shadows dpr={[0.8, 1.5]}
        // *** ADJUST CAMERA POSITION/FOV for desired view ***
        camera={{ position: [22, 4, 8], fov: 22 }} // Moved camera slightly further back, wider FOV
        gl={{ preserveDrawingBuffer: false, powerPreference: "high-performance", antialias: false }} // preserveDrawingBuffer often not needed
        style={{ background: 'transparent' }}
      // No internal loading screen needed if HomePage handles it
      >
        <PerformanceOptimizer>
          <Suspense fallback={<CanvasLoader />}>
            {/* Allow zooming, constrain angles */}
            <OptimizedOrbitControls
              enableZoom={true} // Adjust zoom speed
              maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2.5} // Adjust angles
              enablePan={true} autoRotate={true} autoRotateSpeed={0.3} // Slower auto-rotate
            />
            <ComputerModel
              onClick={handleComputerClick} // Pass navigation click handler
              isMobile={isMobile} onZoomIn={function (): void {
                throw new Error("Function not implemented.");
              } }            // onLoaded not strictly needed if HomePage manages loading screen
            />
          </Suspense>
          <Preload all />
        </PerformanceOptimizer>
      </Canvas>
      {/* Interaction logic is now on the ComputerModel group */}
    </div>
  );
};

export default PortfolioComputer;