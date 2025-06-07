"use client";

import { motion } from "framer-motion";
import { styles as globalStyles } from "./styles";
import localStyles from "./Hero.module.scss"; // Import the SCSS module
// import dynamic from 'next/dynamic';
// import PortfolioComputer from "../3d/PortfolioComputer"; // Reverted to dynamic import below
import ComputersCanvas from "../3d/canvas/Computers";
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

const Hero = () => {
  return (
    <section className={localStyles.heroSection}>

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
            <div style={{ zIndex: 20, position: 'relative', width: '100%', height: '100%'}} > 
              <ComputersCanvas/>
            </div>

      <div className={localStyles.scrollIndicatorContainer}>
        <a href='#about' className={localStyles.scrollIndicatorLink}>
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
      <div style={{ zIndex: 1, position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>

      </div>
    </section>
  );
};
export default Hero;