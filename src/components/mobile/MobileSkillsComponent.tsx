import React, { useState } from "react";
import Image from "next/image";
import { technologies, technicalSkills } from "../../data/index";
import styles from "../styles/MobileSkills.module.scss";
import {
  CodeBlock,
  Database,
  Atom,
  Toolbox,
  Kanban,
  // Diamond,
} from "@phosphor-icons/react";

interface SkillCategoryProps {
  title: string;
  skills: string[];
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const SkillCategory: React.FC<SkillCategoryProps> = ({
  title,
  skills,
  icon,
  isOpen,
  onToggle,
}) => {
  return (
    <div className={styles.category}>
      <div className={styles.categoryHeader} onClick={onToggle}>
        <span className={styles.categoryIcon}>{icon}</span>
        <h3 className={styles.categoryTitle}>{title}</h3>
        <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ""}`}>
          ▾
        </span>
      </div>

      {isOpen && (
        <div className={styles.skillList}>
          {skills.map((skill) => (
            <div key={`${title}-${skill}`} className={styles.skillPill}>
              {skill}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MobileSkillsComponent = () => {
  type CategoryKey =
    | "programming"
    | "frameworks"
    | "databases"
    | "tools"
    | "methodologies";

  const [openCategories, setOpenCategories] = useState<
    Record<CategoryKey, boolean>
  >({
    programming: true,
    frameworks: false,
    databases: false,
    tools: false,
    methodologies: false,
  });

  const toggleCategory = (category: CategoryKey) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const categoryIcons: { [key: string]: React.ReactNode } = {
    programming: <CodeBlock size={24} weight="fill" />,
    frameworks: <Atom size={24} weight="fill" />,
    databases: <Database size={24} weight="fill" />,
    tools: <Toolbox size={24} weight="fill" />,
    methodologies: <Kanban size={24} weight="fill" />,
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.sectionHeadText}>Skills & Technologies</h2>
      <p className={styles.sectionSubText}>My technology stack</p>

      <div className={styles.introduction}>
        <p>
          I have experience with a wide range of modern technologies and
          frameworks. My technical skills include proficiency in multiple
          programming languages, front-end and back-end frameworks, database
          systems, and development tools.
        </p>
      </div>

      {/* Featured Technologies */}
      <div className={styles.featuredSection}>
        <h3 className={styles.featuredTitle}>Featured Technologies</h3>
        <div className={styles.techGrid}>
          {technologies.slice(0, 8).map((technology) => (
            <div key={technology.name} className={styles.techItem}>
              <div className={styles.techImageContainer}>
                <Image
                  src={technology.icon}
                  alt={technology.name}
                  width={40}
                  height={40}
                  className={styles.techImage}
                />
              </div>
              <span className={styles.techName}>{technology.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Skills Categories */}
      <div className={styles.categoriesSection}>
        <h3 className={styles.categoriesTitle}>Technical Expertise</h3>

        <SkillCategory
          title="Programming"
          skills={technicalSkills.programming}
          icon={categoryIcons.programming}
          isOpen={openCategories.programming}
          onToggle={() => toggleCategory("programming")}
        />

        <SkillCategory
          title="Frameworks"
          skills={technicalSkills.frameworks}
          icon={categoryIcons.frameworks}
          isOpen={openCategories.frameworks}
          onToggle={() => toggleCategory("frameworks")}
        />

        <SkillCategory
          title="Databases"
          skills={technicalSkills.databases}
          icon={categoryIcons.databases}
          isOpen={openCategories.databases}
          onToggle={() => toggleCategory("databases")}
        />

        <SkillCategory
          title="Tools"
          skills={technicalSkills.tools}
          icon={categoryIcons.tools}
          isOpen={openCategories.tools}
          onToggle={() => toggleCategory("tools")}
        />

        <SkillCategory
          title="Methodologies"
          skills={technicalSkills.methodologies}
          icon={categoryIcons.methodologies}
          isOpen={openCategories.methodologies}
          onToggle={() => toggleCategory("methodologies")}
        />
      </div>
    </div>
  );
};

export default MobileSkillsComponent;
