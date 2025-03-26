import React, { useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  dpr?: number | [number, number];
  frameRateLimit?: number;
  active?: boolean;
}

/**
 * Component to optimize Three.js performance by:
 * 1. Dynamically adjusting pixel ratio based on performance
 * 2. Limiting frame rate when not interacting
 * 3. Reducing quality during interaction for smoother experience
 */
const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  children,
  dpr = [1, 2],
  frameRateLimit = 30,
  active = true,
}) => {
  const { gl, performance: threePerformance } = useThree();
  const [isInteracting, setIsInteracting] = useState(false);
  const [lowPerformance, setLowPerformance] = useState(false);

  // Monitor performance and adjust settings
  useEffect(() => {
    if (!active) return;

    let avgFps = 60;
    let frameTimes: number[] = [];
    let lastTime = window.performance.now();

    const checkPerformance = () => {
      const now = window.performance.now();
      const frameTime = now - lastTime;
      lastTime = now;

      frameTimes.push(frameTime);
      if (frameTimes.length > 30) frameTimes.shift();

      const avgFrameTime =
        frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
      avgFps = 1000 / avgFrameTime;

      // If avg FPS is consistently below 40, enter low performance mode
      if (avgFps < 40 && !lowPerformance) {
        setLowPerformance(true);
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1));
      } else if (avgFps > 50 && lowPerformance) {
        setLowPerformance(false);
        gl.setPixelRatio(
          Math.min(
            window.devicePixelRatio,
            typeof dpr === "number" ? dpr : dpr[1]
          )
        );
      }
    };

    const perfInterval = setInterval(checkPerformance, 1000);

    // Monitor interaction events
    const startInteraction = () => setIsInteracting(true);
    const stopInteraction = () => {
      setTimeout(() => setIsInteracting(false), 500);
    };

    gl.domElement.addEventListener("pointerdown", startInteraction);
    gl.domElement.addEventListener("pointermove", startInteraction);
    gl.domElement.addEventListener("pointerup", stopInteraction);
    gl.domElement.addEventListener("wheel", startInteraction, {
      passive: true,
    });

    return () => {
      clearInterval(perfInterval);
      gl.domElement.removeEventListener("pointerdown", startInteraction);
      gl.domElement.removeEventListener("pointermove", startInteraction);
      gl.domElement.removeEventListener("pointerup", stopInteraction);
      gl.domElement.removeEventListener("wheel", startInteraction);
    };
  }, [active, gl, dpr, lowPerformance]);

  // Limit frame rate when not interacting
  useFrame((state, delta) => {
    if (!active) return;

    if (!isInteracting && !lowPerformance) {
      const frameInterval = 1 / frameRateLimit;
      const elapsed = state.clock.getElapsedTime();
      const frameFract = elapsed % frameInterval;

      if (frameFract > 0.001 && frameFract < frameInterval - 0.001) {
        state.invalidate();
      }
    }
  });

  return <>{children}</>;
};

export default PerformanceOptimizer;
