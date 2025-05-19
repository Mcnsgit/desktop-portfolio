"use client";

import React, { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper } from "../../hoc";
import { technologies, technicalSkills } from "../../data/index";
import { fadeIn, textVariant } from "../../utils/motion";
import {
  CodeBlock,
  Database,
  Atom,
  Toolbox,
  Kanban,
  Diamond,
} from "@phosphor-icons/react";
// import Image from "next/image";
// import { StaticImageData } from "next/image";
import { styles } from "../cv/styles";
import { useInView } from 'react-intersection-observer'; // Import useInView

// Lazy load BallCanvas with Suspense fallback
const BallCanvas = React.lazy(() => import("../3d/canvas/Ball"));

// interface BallCanvasProps {
//   icon: string | StaticImageData;
//   isInView?: boolean;
// }
// Fallback component for when 3D fails
// const FallbackTechIcon = ({
//   icon,
//   name,
// }: {
//   icon: string | StaticImageData;
//   name: string;
// }) => {
//   return (
//     <div className="w-full h-28 flex items-center justify-center bg-tertiary/30 rounded-full p-4">
//       {typeof icon === "string" ? (
//         <Image
//           src={icon}
//           alt={name}
//           className="w-16 h-16 object-contain"
//           width={64}
//           height={64}
//         />
//       ) : (
//         <Image
//           src={icon}
//           alt={name}
//           width={64}
//           height={64}
//           className="object-contain"
//         />
//       )}
//     </div>
//   );
// };

// Memoizing BallCanvas to prevent unnecessary re-renders
const MemoizedBallCanvas = React.memo(BallCanvas);

interface SkillPillProps {
  skill: string;
  index: number;
  category: string;
}

const SkillPill: React.FC<SkillPillProps> = ({ skill, index, category }) => {
  // Different colors for different categories
  const colors: { [key: string]: string } = {
    programming: "bg-blue-500/80 hover:bg-blue-600/90",
    frameworks: "bg-purple-500/80 hover:bg-purple-600/90",
    databases: "bg-green-500/80 hover:bg-green-600/90",
    tools: "bg-yellow-500/80 hover:bg-yellow-600/90",
    methodologies: "bg-pink-500/80 hover:bg-pink-600/90",
  };

  const color = colors[category] || "bg-gray-500/80 hover:bg-gray-600/90";

  return (
    <motion.div
      variants={fadeIn("up", "spring", index * 0.1, 0.75)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full ${color} text-white text-xs md:text-sm font-medium
        shadow-md cursor-default transition-colors duration-300 m-1 whitespace-nowrap`}
    >
      {skill}
    </motion.div>
  );
};

// interface SkillCategoryProps {
//   title: string;
//   skills: string[];
//   icon?: React.ReactNode;
//   isOpen: boolean;
//   onToggle: () => void;
// }

const SkillCategory: React.FC<{ title: string; skills: string[]; icon?: React.ReactNode; isOpen: boolean; onToggle: () => void; }> = ({ title, skills, icon, isOpen, onToggle }) => {
  const categoryIcons: { [key: string]: React.ReactNode } = {
    programming: <CodeBlock size={24} />,
    frameworks: <Atom size={24} />,
    databases: <Database size={24} />,
    tools: <Toolbox size={24} />,
    methodologies: <Kanban size={24} />,
  };

  const displayIcon = icon || categoryIcons[title.toLowerCase()] || (
    <Diamond size={24} />
  );

  return (
    <motion.div
      variants={fadeIn("left", "spring", 0.2, 0.75)}
      className="mb-8 w-full"
    >
      <div
        className="flex items-center cursor-pointer mb-3 p-2 hover:bg-tertiary/30 rounded-lg transition-colors duration-200"
        onClick={onToggle}
      >
        <span className="text-2xl mr-3 text-white">{displayIcon}</span>
        <h3 className="text-white text-xl font-bold flex-grow">{title}</h3>
        <span
          className="text-xl text-white transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ▸
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap mt-2 pl-9">
              <AnimatePresence>
                {skills.map((skill, index) => (
                  <SkillPill
                    key={`${title}-${skill}`}
                    skill={skill}
                    index={index}
                    category={title.toLowerCase()}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Tech = () => {
  type CategoryKey = "programming" | "frameworks" | "databases" | "tools" | "methodologies";
  const [openCategories, setOpenCategories] = useState<Record<CategoryKey, boolean>>({
    programming: true, frameworks: false, databases: false, tools: false, methodologies: false,
  });

  const toggleCategory = (category: CategoryKey) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Intersection observer for the technology balls section
  const { ref: techBallsRef, inView: techBallsInView } = useInView({
    triggerOnce: false, // Allow triggering multiple times if needed, or true for once
    threshold: 0.1,   // Trigger when 10% is visible
  });

  return (
    <>
      {/* Section Headers */}
      <motion.div variants={textVariant(0.1)}>
        <p className={styles.sectionSubText}>My technology stack</p>
        <h2 className={styles.sectionHeadText}>Skills & Technologies.</h2>
      </motion.div>
      <motion.p variants={fadeIn("up", "spring", 0.2, 1)} className="mt-4 text-secondary text-[16px] max-w-3xl leading-[28px] mb-10">
        I have experience with a wide range of modern technologies and
        frameworks. My technical skills include proficiency in multiple
        programming languages, front-end and back-end frameworks, database
        systems, and development tools. Below are the key technologies I work
        with and my technical skill categories.
      </motion.p>

      {/* 3D Technology Balls Section */}
      <motion.div
        ref={techBallsRef} // Attach ref here
        variants={fadeIn("up", "spring", 0.3, 1)}
        className="mt-8 mb-16"
      >
        <h3 className="text-white text-xl font-medium mb-6 border-b border-secondary/30 pb-2">
          Featured Technologies
        </h3>
        <div className="flex flex-row flex-wrap justify-center gap-10 min-h-[11rem]">
          {/* Only render the Suspense boundary when the section is in view */}
          {techBallsInView && technologies.map((technology) => (
            <motion.div key={technology.name} className="w-24 h-28 md:w-28 md:h-28 flex flex-col items-center" whileHover={{ y: -5, transition: { duration: 0.3 } }}>
              <div className="w-full h-24 md:h-28">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="loader"></div> {/* Simple CSS loader */}
                  </div>
                }>
                  {/* Pass a prop indicating if it should animate based on view */}
                  <MemoizedBallCanvas icon={technology.icon} isInView={techBallsInView} />
                </Suspense>
              </div>
              <p className="text-center text-white/80 mt-2 text-sm">{technology.name}</p>
            </motion.div>
          ))}
          {/* Show simple loader if not in view yet */}
          {!techBallsInView && (
            <div className="w-full flex justify-center items-center min-h-[11rem]">
              <p className="text-secondary">Loading tech visuals...</p>
              {/* Or use the CSS loader */}
              {/* <div className="loader"></div> */}
            </div>
          )}
        </div>
      </motion.div>

      {/* Technical Skills Categories Section */}
      <motion.div variants={fadeIn("up", "spring", 0.5, 1)} className="mt-20">
        <h3 className="text-white text-xl font-medium mb-10 border-b border-secondary/30 pb-2">
          Technical Expertise
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Render SkillCategory components using map for cleaner code */}
          {(Object.keys(technicalSkills) as Array<CategoryKey>).map((key) => (

            <SkillCategory
              key={key}
              title={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize title
              skills={technicalSkills[key]}
              isOpen={openCategories[key]}
              onToggle={() => toggleCategory(key)}
            // Add motion variants if needed for staggered loading of categories
            // variants={fadeIn("left", "spring", index * 0.1 + 0.5 , 0.75)}
            />
          ))}
        </div>
      </motion.div>

      {/* Add styles for loader */}
      <style jsx>{`
        .loader {
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 3px solid #fff;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default SectionWrapper(Tech, "skills");
