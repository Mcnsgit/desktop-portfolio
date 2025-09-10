"use client";

import React, { Suspense, useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { SectionWrapper } from "../../hoc";
import { technologies, technicalSkills } from "../../config/index";
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
import { styles as globalStyles } from "../cv/styles"; // Global styles
import localStyles from "./Tech.module.scss"; // Local SCSS module
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
  // Different colors for different categories are now in SCSS
  const categoryClass = localStyles[category.toLowerCase()] || localStyles.defaultCategory;

  return (
    <motion.div
      variants={fadeIn("up", "spring", index * 0.1, 0.75) as Variants}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      // Combine base pill style with dynamic category style
      className={`${localStyles.skillPill} ${categoryClass}`}
    >
      {skill}
    </motion.div>
  );
};

interface SkillCategoryProps {
    index: number;
    title: string;
    skills: string[];
    icon?: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}

const SkillCategory: React.FC<SkillCategoryProps> = ({ title, skills, icon, isOpen, onToggle }) => {
  const categoryIcons = useMemo(() => ({
    programming: <CodeBlock size={24} />,
    frameworks: <Atom size={24} />,
    databases: <Database size={24} />,
    tools: <Toolbox size={24} />,
    methodologies: <Kanban size={24} />,
  }), []); // Added useMemo for categoryIcons

  const displayIcon = icon || categoryIcons[title.toLowerCase() as keyof typeof categoryIcons] || (
    <Diamond className={localStyles.diamondIcon} size={24} />
  );

  return (
    <motion.div
      variants={fadeIn("left", "spring", 0.2, 0.75) as Variants}
      className={localStyles.skillCategory} 
    >
      <div
        className={localStyles.categoryToggleHeader} 
        onClick={onToggle}
      >
        <span className={localStyles.categoryIcon}>{displayIcon}</span>
        <h3 className={localStyles.categoryTitle}>{title}</h3>
        <span
          className={localStyles.categoryToggleIcon} 
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
            className={localStyles.skillsListContainer} 
          >
            <div className={localStyles.skillsList}>  
              <AnimatePresence>
                {skills.map((skillItem, index) => (
                  <SkillPill
                    key={`${title}-${skillItem}`}
                    skill={skillItem}
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
      <motion.div variants={textVariant(0.1) as Variants} className={localStyles.techHeader}>
        <p className={globalStyles.sectionSubText}>My technology stack</p>
        <h2 className={globalStyles.sectionHeadText}>Skills & Technologies.</h2>
      </motion.div>
      <motion.p variants={fadeIn("up", "spring", 0.2, 1) as Variants } className={localStyles.introParagraph}>
        I have experience with a wide range of modern technologies and
        frameworks. My technical skills include proficiency in multiple
        programming languages, front-end and back-end frameworks, database
        systems, and development tools. Below are the key technologies I work
        with and my technical skill categories.
      </motion.p>


      <motion.div
        ref={techBallsRef}
        variants={fadeIn("up", "spring", 0.3, 1) as Variants}
        className={localStyles.techBallsContainer} 
      >
        <h3 className={localStyles.techBallsHeader}>
          Featured Technologies
        </h3>
        <div className={localStyles.techBallsGrid}>
          {/* Only render the Suspense boundary when the section is in view */}
          {techBallsInView && technologies.map((technology) => (
            <motion.div key={technology.name} className={localStyles.techBallItem} >
              <div className={localStyles.techBallCanvasWrapper}>
                <Suspense fallback={
                  <div className={localStyles.loadingFallback}>
                    <div className={localStyles.loader}></div>
                  </div>
                }>
                  <MemoizedBallCanvas icon={technology.icon} isInView={techBallsInView} />
                </Suspense>
              </div>
              <p className={localStyles.techBallName}>{technology.name}</p>
            </motion.div>
          ))}
          {/* Show simple loader if not in view yet */}
          {!techBallsInView && (
            <div className={localStyles.loadingFallback}>
              <p className={localStyles.loadingText}>Loading tech visuals...</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Technical Skills Categories Section */}
      <motion.div variants={fadeIn("up", "spring", 0.5, 1) as Variants } className={localStyles.skillsCategoriesContainer}>
        <h3 className={localStyles.skillsHeader}> 
          Technical Expertise
        </h3>
        <div className={localStyles.skillsGrid}>
          {(Object.keys(technicalSkills) as Array<CategoryKey>).map((key, index) => (
            <SkillCategory
              index={index}
              key={key}
              title={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize title
              skills={technicalSkills[key]}
              isOpen={openCategories[key]}
              onToggle={() => toggleCategory(key)}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
};

export default SectionWrapper(Tech, "skills");
