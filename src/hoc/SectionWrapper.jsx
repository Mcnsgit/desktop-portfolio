import { motion } from "framer-motion";
import { styles } from "../components/cv/styles";
import { staggerContainer } from "../utils/motion";
import React, { useMemo } from "react";
const StarWrapper = (Component, idName) =>
  function HOC() {
    const variants = useMemo(() => staggerContainer(), []); // Memoizing the variants
    return (
      <motion.section
        variants={variants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className={`${styles.padding} max-w-7xl mx-auto relative z-0`}
      >
        <div id={idName} className="hash-span">
          &nbsp;
        </div>{" "}
        {/* Changed span to div */}
        <Component />
      </motion.section>
    );
  };
export default StarWrapper;
