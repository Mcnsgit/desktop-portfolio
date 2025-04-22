import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Decal,
  Float,
  OrbitControls,
  Preload,
  useTexture
} from "@react-three/drei";
import { StaticImageData } from 'next/image';
import CanvasLoader from '../Loader';
import * as THREE from 'three'

// Define props interface for Ball component
interface BallProps {
  imgUrl: string;
  isInView: boolean;
}

const Ball: React.FC<BallProps> = ({ imgUrl, isInView }) => {
  const [decal, loadError] = useTexture([imgUrl]); // useTexture returns error in tuple
  const meshRef = useRef<THREE.Mesh>(null);

  // Animate only when in view
  useFrame((state, delta) => {
    if (meshRef.current && isInView) {
      // Simple rotation example, can be linked to scrollProgress if that logic is restored
      meshRef.current.rotation.y += delta * 0.5; // Slow continuous rotation
    }
  });

  // Handle texture loading error
  if (loadError) {
    console.error(`Failed to load texture: ${imgUrl}`, loadError);
    // Render a fallback or null
    return (
      <mesh scale={2.75}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#555555" flatShading />
      </mesh>
    );
  }

  return (
    // Conditionally apply Float animation only when in view? Optional.
    <Float speed={isInView ? 1.75 : 0} rotationIntensity={isInView ? 1 : 0} floatIntensity={isInView ? 2 : 0}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[0, 0, 0.05]} intensity={0.6} />
      <mesh castShadow receiveShadow scale={2.75} ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#fff8eb"
          polygonOffset
          polygonOffsetFactor={-5}
          flatShading // flatShading is boolean, not string
        />
        {decal && ( // Only render Decal if texture loaded successfully
          <Decal
            position={[0, 0, 1]}
            rotation={[2 * Math.PI, 0, 6.25]} // Adjust rotation if needed
            scale={1}
            map={decal}
          // flatShading prop removed from Decal
          />
        )}
      </mesh>
    </Float>
  );
};

interface BallCanvasProps {
  icon: string | StaticImageData;
  isInView: boolean; // Receive isInView prop
  // Removed scrollProgress as we switched to simpler inView logic
}

const BallCanvas: React.FC<BallCanvasProps> = ({ icon, isInView }) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // Resolve StaticImageData to string URL on the client side
    if (typeof icon === 'string') {
      setIconUrl(icon);
    } else if (icon && typeof icon === 'object' && 'src' in icon) {
      setIconUrl(icon.src);
    } else {
      console.error('Invalid icon format passed to BallCanvas:', icon);
      setError(true);
    }
  }, [icon]);

  if (error || !iconUrl) {
    // Render a placeholder if icon format is invalid or URL is not set
    return <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-full"><span className="text-red-500 text-xs">!</span></div>;
  }

  return (
    // Only render Canvas when in view to save resources
    <>
      {isInView && (
        <Canvas frameloop="demand" dpr={[1, 1.5]} gl={{ preserveDrawingBuffer: true }}>
          <Suspense fallback={<CanvasLoader />}>
            <OrbitControls enableZoom={false} enablePan={false} />
            <Ball imgUrl={iconUrl} isInView={isInView} />
          </Suspense>
          <Preload all />
        </Canvas>
      )}
      {!isInView && ( // Optional: Show a static placeholder if not in view
        <div className="w-full h-full flex items-center justify-center bg-tertiary/10 rounded-full">
          {/* You could put a static image here */}
        </div>
      )}
    </>
  );
};

export default BallCanvas; // Ensure default export