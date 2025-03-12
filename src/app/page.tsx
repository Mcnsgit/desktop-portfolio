"use client"
// pages/index.tsx
import React, { Suspense, useState, useEffect, EventHandler } from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import CanvasLoader from '@/components/3d/Loader';
import StarsCanvas from '@/components/3d/canvas/Stars';
import { useRouter } from 'next/navigation';
import BootAnimation from '../components/3d/BootAnimation';
import Navbar from '../components/cv/Navbar'
import Hero from '../components/cv/Hero'
// Computer model that navigates to desktop when clicked
const ComputerModel = () => {
  const router = useRouter();
  const computer = useGLTF("./desktop_pc/scene.gltf");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Computer clicked, navigating to desktop...');
    router.push('/desktop');
  };

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
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile devices
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    // Skip boot animation in development
    if (process.env.NODE_ENV === 'development') {
      setIsBooting(false);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBootComplete = () => {
    setIsBooting(false);
  };

  // On mobile, go straight to desktop
  useEffect(() => {
    if (isMobile) {
      const router = require('next/navigation').useRouter();
      router.push('/desktop');
    }
  }, [isMobile]);

  if (isBooting) {
    return <BootAnimation onComplete={handleBootComplete} skipAnimation={isMobile} />;
  }

  return (
      <div className='relative z-0 bg-primary'>
      <StarsCanvas />
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Navbar/>
      <Hero />
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <Canvas
          frameloop="demand"
          shadows
          camera={{ position: [20, 3, 5], fov: 25 }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <Suspense fallback={<CanvasLoader />}>
            <OrbitControls
              enableZoom={true}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 4}
              enablePan={true}
              autoRotate={false              }
              autoRotateSpeed={0.5}
            />
            <ComputerModel />
          </Suspense>
          <Preload all />
        </Canvas>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontSize: '16px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '10px 20px',
        borderRadius: '5px'
      }}>
        Click on the computer to enter desktop mode
      </div>
    </div>
  );
}