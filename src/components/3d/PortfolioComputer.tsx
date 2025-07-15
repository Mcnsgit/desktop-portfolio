// "use client"; // Add directive

// import React, { Suspense, useCallback, useEffect, useState, useRef } from "react";
// import { Canvas, useThree } from "@react-three/fiber";
// import {  Preload, useGLTF } from "@react-three/drei";
// // import * as THREE from "three";
// import OptimizedOrbitControls from "./OptimizedOrbitControls";
// import PerformanceOptimizer from "./PerformanceOptimizer";
// import { useRouter } from "next/navigation";
// import { useSounds } from "@/hooks/useSounds";
// import CanvasLoader from "./Loader";
// import { useControls} from "leva"

// // const SceneBackgroundTransparent = () => {
// //   const { scene, gl } = useThree(); 

// //   useEffect(() => {
// //     scene.background = null; // Make scene background transparent
// //     gl.setClearAlpha(0);    // Ensure the WebGLRenderer clear color has alpha 0
// //   }, [scene, gl]);
// //   return null;
// // };
// const ComputerModel = ({ isMobile }: { isMobile: boolean }) => {
  
//   const computer =  useGLTF("./90s_desktop_pc_-_psx/scene-draco.gltf");

//   const router = useRouter();
//   const { playSound } = useSounds();
//   // Load the GLTF model - ensure the path is correct relative to the public folder

//   // Click handler for navigation
//   const handleClick = useCallback((event: React.MouseEvent) => { // Use React MouseEvent type
//     event.stopPropagation(); // Stop propagation in the 3D scene
//     playSound("click");
//     console.log("Computer model clicked, navigating...");
//     setTimeout(() => router.push("/desktop"), 100);
//   }, [router, playSound]);

//   // // Optional: Effect to traverse and update materials if needed
//   // useEffect(() => {
//   //   computer.scene?.traverse((child) => {
//   //     if (child instanceof THREE.Mesh) {
//   //       child.material.needsUpdate = true;
//   //       // Add other material adjustments if necessary
//   //     }
//   //   });
//   // }, [computer.scene]);

//   return (
//     // Add the onClick handler to the group containing the primitive
//     <group onClick={handleClick} dispose={null}>
//       <mesh>
//         <ambientLight intensity={0.75} />
//         <hemisphereLight intensity={0.8} groundColor="black" />
//         <spotLight
//           position={[-20, 50, 10]}
//           angle={0.12}
//           penumbra={1}
//           intensity={2.5} // Increased intensity
//           castShadow
//           shadow-mapSize={1024}
//         />
//         <pointLight intensity={2.0} /> {/* Increased intensity */}
//         <primitive
//           object={computer.scene}
//           scale={isMobile ? 0.7 : 0.75}
//           position={isMobile ? [0, -3, -2.2] : [0, -3.25, -1.5]}
//           rotation={[0.01, 1.0, 0.1]}
//         />
//         </mesh>
//     </group>
//   );
// };
// // --- End ComputerModel Component ---


// // --- PortfolioComputer Component ---
// // This sets up the Canvas environment for the model
// const PortfolioComputer: React.FC = () => {
//   const [isMobile, setIsMobile] = useState(false);
//   const eventSourceRef = useRef<HTMLDivElement>(null); // Declare refs at the top

//   useEffect(() => {
//     // Ensure this runs only on the client side
//     if (typeof window !== 'undefined') {
//       const mediaQuery = window.matchMedia("(max-width: 500px)");

//       setIsMobile(mediaQuery.matches);

//       const handleMediaQueryChange = (e: MediaQueryListEvent) => { // Use MediaQueryListEvent type
//         setIsMobile(e.matches);
//       };

//       mediaQuery.addEventListener("change", handleMediaQueryChange);

//       return () => {
//         mediaQuery.removeEventListener("change", handleMediaQueryChange);
//       };
//     }
//   }, []);
  
//   return (
//     <div ref={eventSourceRef} className="w-full h-full pointer-events-auto bg-transparent"> {/* Allow pointer events on canvas container, ensure transparent bg */}
//       {/* Canvas will only render client-side due to dynamic import in parent */}
//       <Canvas
//         frameloop="demand"
//         shadows
//         dpr={[1, 2]}
//         camera={{ position: [20, 3, 5], fov: 25 }} // Keep camera settings
//         gl={{ preserveDrawingBuffer: true, alpha: true }}
//         eventSource={eventSourceRef.current ?? undefined}
//         >

//         <PerformanceOptimizer>
//           <Suspense fallback={<CanvasLoader />}>
//             <OptimizedOrbitControls
//               enableZoom={true}
//               maxPolarAngle={Math.PI}
//               minPolarAngle={0} // Lock vertical
//               enableDamping={true} // Added enableDamping here
//               dampingFactor={0.25} // Optional: adjust damping factor
//             />
//               <ComputerModel isMobile={isMobile} />
//             </Suspense>
//           <Preload all />
//         </PerformanceOptimizer>
//       </Canvas>
//     </div>
//   );
// };

// export default PortfolioComputer;
