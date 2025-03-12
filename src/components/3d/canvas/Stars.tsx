import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
// Create a type declaration for custom random function
// Define props type for Stars component
interface StarsProps {
  [key: string]: never; // Allow any props to pass through to Points
}
// Custom function to generate random points in a sphere
const randomPointsInSphere = (numPoints: number, radius: number) => {
  const points = new Float32Array(numPoints * 3);
  for (let i = 0; i < numPoints; i++) {
    const theta = Math.random() * Math.PI * 2; // Random angle
    const phi = Math.acos(2 * Math.random() - 1); // Random angle for spherical coordinates
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    points.set([x, y, z], i * 3);
  }
  return points;
};
const Stars = (props: StarsProps) => {
  const ref = useRef<THREE.Points>(null); // Correct ref type for Points component
  // Create and validate the sphere data
  const sphere = useMemo(() => {
    const data = randomPointsInSphere(5000, 1.2); // Generate points in a sphere
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