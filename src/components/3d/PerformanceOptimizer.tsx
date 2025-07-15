import React, { useState, useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { supports3DTransforms } from "@/utils/browserSupport";

/**
 * Component to optimize 3D performance based on device capabilities
 */
const PerformanceOptimizer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { gl } = useThree();
  const [quality, setQuality] = useState(1.0);
  const frameSkipRef = useRef(0);
  const maxFrameSkip = useRef(0);
  const lastUpdateTime = useRef(0);
  const frameRateHistory = useRef<number[]>([]);
  const backgroundColor = useRef(false);
  // Detect device capabilities on mount
  useEffect(() => {
    // Check for 3D support
    const has3D = supports3DTransforms();

    // Check for limited hardware
    const isBudgetDevice =
      ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) ||
      ('hardwareConcurrency' in navigator && navigator.hardwareConcurrency < 4);

    // Set initial quality based on device capabilities
    if (!has3D || isBudgetDevice) {
      setQuality(0.6); // Lower quality for budget devices
      maxFrameSkip.current = 1; // Skip every other frame
    } else {
      // Check if it's a high-end device
      const isHighEnd =
        ('deviceMemory' in navigator && (navigator as any).deviceMemory >= 8) &&
        ('hardwareConcurrency' in navigator && navigator.hardwareConcurrency >= 8);

      if (isHighEnd) {
        setQuality(1.0);
        maxFrameSkip.current = 0;
      } else {
        // Mid-range device
        setQuality(0.8);
        maxFrameSkip.current = 0;
      }
    }

    // Set pixel ratio based on quality
    gl.setPixelRatio(Math.min(window.devicePixelRatio * quality, 2));

    // Apply other optimizations
    if (backgroundColor.current) {
      gl.setClearColor(0x050816, 1);
    } else {
      gl.setClearColor(0x050816, 1);
    }

    // Return cleanup function
    return () => {
      frameRateHistory.current = [];
    };
  }, [gl, quality]);

  // Monitor performance and adjust settings dynamically
  useFrame(({ clock }) => {
    const currentTime = clock.getElapsedTime();
    const deltaTime = currentTime - lastUpdateTime.current;

    // Skip frames if needed for performance
    if (frameSkipRef.current < maxFrameSkip.current) {
      frameSkipRef.current++;
      return;
    }

    frameSkipRef.current = 0;
    lastUpdateTime.current = currentTime;

    // Calculate current FPS
    const currentFPS = deltaTime > 0 ? 1 / deltaTime : 60;

    // Keep a history of recent frame rates
    frameRateHistory.current.push(currentFPS);
    if (frameRateHistory.current.length > 60) {
      frameRateHistory.current.shift();
    }

    // If we have enough samples, check if we need to adjust quality
    if (frameRateHistory.current.length >= 30) {
      const averageFPS = frameRateHistory.current.reduce((a, b) => a + b, 0) /
        frameRateHistory.current.length;

      // If FPS is consistently low, reduce quality
      if (averageFPS < 30 && quality > 0.6) {
        setQuality(prevQuality => Math.max(0.6, prevQuality - 0.1));
        maxFrameSkip.current = Math.min(maxFrameSkip.current + 1, 2);
        frameRateHistory.current = []; // Reset history after adjustment
      }
      // If FPS is consistently high, increase quality
      else if (averageFPS > 55 && quality < 1.0) {
        setQuality(prevQuality => Math.min(1.0, prevQuality + 0.1));
        maxFrameSkip.current = Math.max(maxFrameSkip.current - 1, 0);
        frameRateHistory.current = []; // Reset history after adjustment
      }
    }
  });

  return <>{children}</>;
};

export default PerformanceOptimizer;