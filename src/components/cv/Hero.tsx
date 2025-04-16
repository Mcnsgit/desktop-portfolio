"use client"; // Add "use client" directive

import { motion } from "framer-motion";
import { styles } from "./styles"; // Assuming styles are correctly imported
import { StarsCanvas } from "../3d/canvas";

const Hero = () => {
  return (
    <section className="relative w-full h-screen mx-auto flex items-center">
      <StarsCanvas />
      <div
        // Use styles.paddingX for consistent padding
        className={`max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5`}
      >
        {/* Decorative line */}
        <div className="flex flex-col justify-center items-center mt-5">
          <div className="w-5 h-5 rounded-full bg-[#915EFF]" />
          <div className="w-1 sm:h-80 h-40 violet-gradient" /> {/* Gradient defined in CSS? */}
        </div>

        {/* Hero Text */}
        <div>
          <motion.h1 // Add motion for animation
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`${styles.heroHeadText} text-white`}
          >
            Hi, I&apos;m <span className="text-[#915eff]">Miguel</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`${styles.heroSubText} mt-2 text-white-100`}
          >
            I build user-friendly websites and digital tools, <br className="sm:block hidden" />
            translating ideas into clear online experiences. {/* More grounded text */}
          </motion.p>
        </div>
      </div>
      <div className="absolute xs:bottom-10 bottom-16 w-full flex justify-center items-center">
        <a href="#about" aria-label="Scroll to about section">
          <div className="w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2 hover:border-white transition-colors">
            <motion.div
              animate={{ y: [0, 24, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
              className="w-3 h-3 rounded-full bg-secondary mb-1"
            />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero; // Ensure default export