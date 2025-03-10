import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  Preload, 
  useGLTF, 
  // Html,
  // PerspectiveCamera,
  // useTexture
} from "@react-three/drei";
// import * as THREE from 'three';
import CanvasLoader from "./Loader";


  // // Find the screen mesh in the model
  // useEffect(() => {
  //   if (computer && computer.scene) {
  //     // This is a simplified approach - you'll need to identify the proper screen mesh
  //     // from your model's structure. You can use a debugger or console.log to explore it.
  //     computer.scene.traverse((child) => {
  //       if (child.isMesh && 
  //          (child.name.toLowerCase().includes('screen') || 
  //           child.name.toLowerCase().includes('monitor') ||
  //           child.name.toLowerCase().includes('display'))) {
  //         screenMeshRef.current = child;
  //         if (screenRef) screenRef.current = child;
  //       }
  //     });
      
  //     if (!screenMeshRef.current) {
  //       console.warn("Screen mesh not found in computer model, using first mesh found");
  //       computer.scene.traverse((child) => {
  //         if (child.isMesh && !screenMeshRef.current) {
  //           screenMeshRef.current = child;
  //           if (screenRef) screenRef.current = child;
  //         }
  //       });
  //     }
  //   }
  // }, [computer, screenRef]);
  // useFrame((state) => {
    //   if (!modelRef.current) return;
    
    //   if (isZoomed && screenMeshRef.current) {
      //     // Get screen position and create a position in front of it
      //     const screenPosition = new THREE.Vector3();
      //     screenMeshRef.current.getWorldPosition(screenPosition);
      
      //     // Get direction the screen is facing (normal)
      //     const normal = new THREE.Vector3(0, 0, 1);
      //     normal.applyQuaternion(screenMeshRef.current.quaternion);
      
      //     // Position camera slightly in front of screen
      //     const targetPosition = screenPosition.clone().add(normal.multiplyScalar(0.5));
      
      //     // Smoothly move camera
      //     camera.position.lerp(targetPosition, 0.05);
      //     camera.lookAt(screenPosition);
      //   }
      // });


// Computer model component
const ComputerModel = ({ onZoomIn }) => {
  const computer = useGLTF("./desktop_pc/scene.gltf");
  const modelRef = useRef();
  const handleModelClick = (e) => {
    e.stopPropagation();
    onZoomIn();
  };
  return (
    <group 
      ref={modelRef} 
      onClick={handleModelClick}
      dispose={null}
    >
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
const PortfolioComputer = ({ children }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.matchMedia("(max-width: 768px)").matches);
  // Handle responsive layout
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaQueryChange = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);
  const handleZoomIn = () => setIsZoomed(true);
  const handleZoomOut = () => setIsZoomed(false);
  if (isMobile) {
    return children;
  }
  return (
    <div className="portfolio-computer" style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {!isZoomed ? (
        <Canvas
          frameloop="demand"
          shadows
          dpr={[1, 2]}
          camera={{ position: [20, 3, 5], fov: 25 }}
          gl={{ preserveDrawingBuffer: true }}
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
      ) : (
        <div className="zoomed-interface" style={{ width: '100%', height: '100%', position: 'relative' }}>
          <button
            onClick={handleZoomOut}
            className="back-button"
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
              cursor: 'pointer'
            }}
          >
            Back to 3D View
          </button>
          {children}
        </div>
      )}
    </div>
  );
};
export default PortfolioComputer;