import React, { Suspense, useEffect, useState } from 'react';
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
interface BallProps {
  imgUrl: string;
  isInView: boolean;
}
const Ball: React.FC<BallProps> = ({ imgUrl }) => {
  const [decal, loadError] = useTexture([imgUrl]);
  // Handle texture loading error
  if (loadError) {
    console.error(`Failed to load texture: ${imgUrl}`, loadError);
    return (
      <mesh >
        <icosahedronGeometry  />
        <meshStandardMaterial color="#555555" flatShading />
      </mesh>
    );
  }
  return (
    <Float floatIntensity={2}>
      <mesh castShadow receiveShadow scale={2.75}>
        <icosahedronGeometry args={[1, 4]} />
        <meshPhysicalMaterial
          color="#b2c2b5"
          emissive="#999999"
          
          polygonOffset
          roughness={0}
          metalness={1}


        />
        {decal && (
          <Decal
            position={[0, 0, 1]}
            rotation={[2 * Math.PI, 0, 6.25]}
            scale={1}
            map={decal}
          />
        )}
      </mesh>
    </Float>
  );
};
interface BallCanvasProps {
  icon: string | StaticImageData;
  isInView: boolean;
}
const BallCanvas: React.FC<BallCanvasProps> = ({ icon, isInView }) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  useEffect(() => {
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
    return <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-full"><span className="text-red-500 text-xs">!</span></div>;
  }
  return (
    <>
      {isInView && (
        <Canvas frameloop="demand" dpr={[1, 1.5]} gl={{ preserveDrawingBuffer: true }}>
          <Suspense fallback={<CanvasLoader />}>
            <ambientLight intensity={0.35} />
            <directionalLight position={[0, 0, 0.05]} intensity={0.6} />
            <OrbitControls enableZoom={false} enablePan={false} />
            <Ball imgUrl={iconUrl} isInView={isInView} />
          </Suspense>
          <Preload all />
        </Canvas>
      )}
      {!isInView && (
        <div className="w-full h-full flex items-center justify-center bg-tertiary/10 rounded-full">
          {/* You could put a static image here */}
        </div>
      )}
    </>
  );
};
export default BallCanvas;