import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import * as THREE from "three";

// Create a type declaration for maath functions

// Define props type for Stars component
interface StarsProps {
  [key: string]: any; // Allow any props to pass through to Points
}

const Stars = (props: StarsProps) => {
  const ref = useRef<THREE.Points>(null); // Correct ref type for Points component

  // Create and validate the sphere data
  const sphere = useMemo(() => {
    const data = random.inSphere(new Float32Array(5000), { radius: 1.2 }) as Float32Array;
    
    // Validate the data to ensure there are no NaN values
    for (let i = 0; i < data.length; i++) {
      if (isNaN(data[i])) {
        console.warn(`Found NaN at index ${i}, replacing with 0`);
        data[i] = 0;
      }
    }
    
    return data;
  }, []);

  const rotationSpeed = { x: 0.1, y: 0.0667 };
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta * rotationSpeed.x;
      ref.current.rotation.y -= delta * rotationSpeed.y;
    }
  });
  
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled
        {...props}
      >
        <PointMaterial
          transparent
          color='#f272c8'
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const StarsCanvas = () => {
  return (
    <div className='w-full h-auto absolute inset-0 z-[-1]'>
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          <Stars />
        </Suspense>
        {/* Removed Preload component that was causing errors */}
      </Canvas>
    </div>
  );
};

export default StarsCanvas;