"use client";

import { motion } from "framer-motion";
import { styles } from "./styles";
// Import the computer component
import PortfolioComputer from "../3d/PortfolioComputer"; // Adjust path if necessary
import { StarsCanvas } from "../3d/canvas";
const Hero = () => {
  return (
    // Make section relative to contain absolute elements
    // Use flex to layout text and computer model
    <section className="relative w-full h-screen mx-auto">
{/* <StarsCanvas/> */}
      {/* Content container */}
      <div
        className={`max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5 relative z-10`} // Ensure text is above canvas
      >
        {/* Decorative line */}
        <div className="flex flex-col justify-center items-center mt-5">
          <div className="w-5 h-5 rounded-full bg-[#915EFF]" />
          <div className="w-1 sm:h-80 h-40 violet-gradient" />
        </div>

        {/* Hero Text */}
        <div className="pt-8 md:pt-0"> {/* Add padding top for text */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className={`${styles.heroHeadText} text-white`}
          >
            Hi, I&apos;m <span className="text-[#915eff]">Miguel</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className={`${styles.heroSubText} mt-2 text-white-100 max-w-xl`} // Added max-width
          >
            I build user-friendly websites and digital tools, <br className="sm:block hidden" />
            translating ideas into online experiences. {/* More grounded text */}
          </motion.p>
        </div>
      </div>

      {/* 3D Computer Model Container */}
      {/* Position this container within the hero section */}
      {/* Adjust width/height/positioning as needed for your layout */}
      <div className="absolute inset-3 md:relative md:flex-1 w-full h-full md:h-auto pointer-events-none md:pointer-events-auto z-0 md:z-10">
        {/* Ensure this div allows pointer events if needed, but Canvas inside handles its own */}

        <PortfolioComputer />
</div>
      {/* Scroll Down Indicator - Positioned relative to the main section */}
      <div className="absolute xs:bottom-10 bottom-16 w-full flex justify-center items-center z-10">
        <a href="#about" aria-label="Scroll to about section">
          <div className="w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2 hover:border-white transition-colors">
            <motion.div
              animate={{ y: [0, 24, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
              className="w-3 h-3 rounded-full bg-secondary mb-1"
            />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;