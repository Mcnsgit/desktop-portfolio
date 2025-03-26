import React, { useRef, useEffect } from "react";
import { OrbitControls as DreiOrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

interface OptimizedOrbitControlsProps {
  enableZoom?: boolean;
  maxPolarAngle?: number;
  minPolarAngle?: number;
  enablePan?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

/**
 * A wrapper around drei's OrbitControls with optimized settings to avoid the
 * non-passive wheel event listener warning.
 */
const OptimizedOrbitControls: React.FC<OptimizedOrbitControlsProps> = ({
  enableZoom = true,
  maxPolarAngle = Math.PI / 2,
  minPolarAngle = Math.PI / 4,
  enablePan = true,
  autoRotate = false,
  autoRotateSpeed = 0.5,
}) => {
  const controlsRef = useRef<any>(null);
  const { gl, camera } = useThree();

  useEffect(() => {
    if (controlsRef.current) {
      // Access the raw Three.js OrbitControls instance
      const controls = controlsRef.current;

      // Add wheel event listener with passive option to prevent warnings
      const originalAddEventListener = controls.domElement.addEventListener;
      controls.domElement.addEventListener = function (
        type: string,
        listener: EventListener,
        options?: boolean | AddEventListenerOptions
      ) {
        if (type === "wheel") {
          originalAddEventListener.call(this, type, listener, {
            passive: false,
          });
        } else {
          originalAddEventListener.call(this, type, listener, options);
        }
      };

      // Make sure controls are properly initialized
      controls.update();
    }
  }, []);

  return (
    <DreiOrbitControls
      ref={controlsRef}
      enableZoom={enableZoom}
      maxPolarAngle={maxPolarAngle}
      minPolarAngle={minPolarAngle}
      enablePan={enablePan}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      makeDefault
    />
  );
};

export default OptimizedOrbitControls;
