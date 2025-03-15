import { motion } from "framer-motion";
import { styles } from "../components/cv/styles";
import { staggerContainer } from "../utils/motion";
import React, { useMemo } from "react";
type StarWrapperProps = {
  idName: string; // Only keep the idName if that's all you need
};
const StarWrapper = (Component: React.FC, idName: string) => {
  return function HOC() {
    const variants = useMemo(() => staggerContainer(0.1, 0.2), []);

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
        </div>
        <Component />
      </motion.section>
    );
  };
};
export default StarWrapper;
