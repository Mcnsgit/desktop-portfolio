import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Decal,
  Float,
  OrbitControls,
  Preload,
  useTexture
} from "@react-three/drei";
import { StaticImageData } from 'next/image';
import CanvasLoader from '../Loader';

// Define props interface for Ball component
interface BallProps {
  imgUrl: string;
}

const Ball = ({ imgUrl }: BallProps) => {
  // Fix for TypeScript error - using proper error handling with useTexture
  const [decal] = useTexture([imgUrl], 
    // We're using an onError callback below, so we don't need a separate success callback
    undefined
  );
  
  // Use React state to track errors in the component
  const [hasError, setHasError] = useState(false);
  
  // Catch texture loading errors
  React.useEffect(() => {
    const handleError = () => setHasError(true);
    
    // Create an image element to test if the texture can be loaded
    const img = new Image();
    img.onerror = handleError;
    img.src = imgUrl;
    
    return () => {
      img.onerror = null;
    };
  }, [imgUrl]);

  // If there was an error loading the texture, render a fallback sphere
  if (hasError) {
    return (
      <Float speed={1.75} rotationIntensity={1} floatIntensity={2}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[0, 0, 0.05]} />
        <mesh castShadow receiveShadow scale={2.75}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color='#ff4444'  // Red color to indicate error
            polygonOffset
            polygonOffsetFactor={-5}
            flatShading={true}
          />
        </mesh>
      </Float>
    );
  }

  return (
    <Float speed={1.75} rotationIntensity={1} floatIntensity={2}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[0, 0, 0.05]} />
      <mesh castShadow receiveShadow scale={2.75}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color='#fff8eb'
          polygonOffset
          polygonOffsetFactor={-5}
          flatShading={true}
        />
        <Decal
          position={[0, 0, 1]}
          rotation={[2 * Math.PI, 0, 6.25]}
          scale={1}
          map={decal}
        />
      </mesh>
    </Float>
  );
};

// Define props interface for BallCanvas component
interface BallCanvasProps {
  icon: string | StaticImageData;
  size?: number; // Optional size parameter for the ball
}

const BallCanvas = ({ icon, size = 28 }: BallCanvasProps) => {
  const [hasError, setHasError] = useState(false);
  
  // Convert icon to string URL if it's a StaticImageData object
  const getIconUrl = () => {
    if (typeof icon === 'string') {
      return icon;
    } else if (icon && typeof icon === 'object' && 'src' in icon) {
      return (icon as StaticImageData).src;
    } else {
      console.error('Invalid icon format:', icon);
      setHasError(true);
      return '';
    }
  };
  
  // If there's an error with the icon format, render a placeholder
  if (hasError) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center bg-gray-800 rounded-full"
        style={{ width: size, height: size }}
      >
        <div className="text-white text-xs">Invalid Image</div>
      </div>
    );
  }

  return (
    <Canvas
      frameloop='demand'
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls enableZoom={false} />
        <Ball imgUrl={getIconUrl()} />
      </Suspense>
      <Preload all />
    </Canvas>
  );
};

export default BallCanvas;