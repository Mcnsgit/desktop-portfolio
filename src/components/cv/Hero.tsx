"use client";

import { motion } from "framer-motion";
import { styles as globalStyles } from "./styles";
import localStyles from "./Hero.module.scss"; // Import the SCSS module
// import dynamic from 'next/dynamic';
// import PortfolioComputer from "../3d/PortfolioComputer"; // Reverted to dynamic import below
import ComputersCanvas from "../3d/canvas/Computers";
// import PerformanceOptimizer from "../3d/PerformanceOptimizer";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import StarsCanvas from "../3d/canvas/Stars";
// Dynamically import client-side heavy components
// const PortfolioComputer = dynamic(() => import("../3d/PortfolioComputer"), {
  // ssr: false,
  // Optional: loading component while PortfolioComputer loads
  // loading: () => <p>Loading 3D Model...</p>,
// });
// const StarsCanvas = dynamic(() => import("../3d/canvas").then(mod => mod.StarsCanvas), {
  // ssr: false,
  // Optional: loading component
  // loading: () => <p>Loading Stars...</p>,
// });

interface HeroProps {
  onComputerClick: () => void;
}

const Hero = ({ onComputerClick }: HeroProps) => {
  console.log("Hero component received onComputerClick:", onComputerClick);

  return (
    <section className={localStyles.heroSection}>
      <ErrorBoundary
      componentName="Hero"
      fallback={<div className={localStyles.errorFallback}>Error loading Hero</div>}>

      <StarsCanvas /> 


      <div
        className={`${localStyles.heroContent} ${globalStyles.paddingX}`}
      >
        <div className={localStyles.lineContainer}>
          <div className={localStyles.dot} />
          <div className={`${localStyles.line} ${localStyles.violetGradient}`} />
        </div>
        {/* Hero Text */}
        <div className={localStyles.heroTextContainer}>
          <h1 className={`${globalStyles.heroHeadText} ${localStyles.heroHeadText}`}>
            Hi, I&apos;m <span className={localStyles.heroName}>Miguel</span>
          </h1>
          <p className={`${globalStyles.heroSubText} ${localStyles.heroSubText}`} >
            I build user-friendly websites and digital tools,{" "}
            <br className={localStyles.break} /> translating ideas into online experiences.
          </p>
        </div>
      </div>
      <ComputersCanvas onComputerClick={onComputerClick} />
      <div className={localStyles.scrollIndicatorContainer}>
        <a href='#computer' className={localStyles.scrollIndicatorLink}>
          <div className={localStyles.scrollIndicatorOuter}>
            <motion.div
              animate={{
                y: [0, 24, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className={localStyles.scrollIndicatorInner}
            />
          </div>
        </a>
      </div>
      </ErrorBoundary>
    </section>
  );
};
export default Hero;