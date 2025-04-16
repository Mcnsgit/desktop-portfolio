"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { SectionWrapper } from "../../hoc";
import { styles } from "./styles";
import { portfolioProjects as projects } from '../../data/portfolioData';
import { fadeIn, textVariant } from "../../utils/motion";
import { GithubLogo, ArrowSquareOut, X } from "@phosphor-icons/react";
import { StaticImageData } from "next/image";

interface ProjectCardProps {
  index: number;
  name: string;
  description: string;
  tags: Array<{ name: string; color: string }>;
  image: string | StaticImageData;
  source_code_link?: string;
  live_link?: string;
  isExpanded: boolean;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  index,
  name,
  description,
  tags,
  image,
  source_code_link,
  live_link,
  isExpanded,
  onClick,
}) => {
  return (
    <motion.div
      variants={fadeIn("up", "spring", index * 0.5, 0.75)}
      className="bg-tertiary p-5 rounded-2xl sm:w-[360px] w-full relative cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-full h-[230px] overflow-hidden rounded-2xl">
        {typeof image === "string" ? (
          <Image
            src="/placeholder.jpg"
            alt={name}
            className="w-full h-full object-cover"
            width={360}
            height={230}
            style={{
              transition: "transform 0.5s ease",
            }}
          />
        ) : (
          <Image
          width={800}
          height={300}
            src="/placeholder.jpg"
            alt={name}
            className="w-full h-full object-cover"
            style={{
              transition: "transform 0.5s ease",
            }}
          />
        )}

        {/* Project Links - Always visible */}
        <div className="absolute top-2 right-2 flex gap-2">
          {/* GitHub Link */}
          <div
            className="black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              window.open(source_code_link, "_blank", "noopener,noreferrer");
            }}
            title="View Source Code"
          >
            <GithubLogo className="w-1/2 h-1/2 text-white" />
          </div>

          {/* Live Demo Link (if available) */}
          {live_link && (
            <div
              className="black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                window.open(live_link, "_blank", "noopener,noreferrer");
              }}
              title="View Live Demo"
            >
              <ArrowSquareOut className="w-1/3 h-1/3 text-white" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-white font-bold text-[24px]">{name}</h3>
        <p className="mt-2 text-secondary text-[14px] line-clamp-2">
          {description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={`${name}-${tag.name}`}
            className={`text-[14px] ${tag.color} px-2 py-1 rounded-md bg-black/20`}
          >
            #{tag.name}
          </span>
        ))}
      </div>

      {/* Expanded project details - only shown when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="bg-tertiary rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
            >
              <div className="relative">
                <div className="relative w-full h-[300px] overflow-hidden">
                  {typeof image === "string" ? (
                    <Image
                      src="/placeholder.jpg"
                      alt={name}
                      className="w-full h-full object-cover"
                      width={800}
                      height={300}
                    />
                  ) : (
                    <Image
                    width={800}
                    height={300}
                      src="/placeholder.jpg"
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <button
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors duration-300"
                  onClick={onClick}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <h2 className="text-white font-bold text-[32px] mb-4">
                  {name}
                </h2>
                <p className="text-secondary text-[16px] mb-6">{description}</p>

                <div className="mb-6">
                  <h3 className="text-white font-bold text-[18px] mb-2">
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={`modal-${name}-${tag.name}`}
                        className={`text-[14px] ${tag.color} px-2 py-1 rounded-md bg-black/20`}
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <a
                    href={source_code_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-md flex items-center gap-2 transition-colors duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GithubLogo size={20} /> View Code
                  </a>

                  {live_link && (
                    <a
                      href={live_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-white/80 text-primary px-6 py-3 rounded-md flex items-center gap-2 transition-colors duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowSquareOut size={20} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Works = () => {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const handleProjectClick = (index: number) => {
    setExpandedProject(expandedProject === index ? null : index);
  };
  // Check if projects data is loaded
  if (!projects || projects.length === 0) {
    console.warn("Works component: No project data found.");
    // Optionally render a message or fallback
    return (
      <div className="text-center text-secondary py-10">
        Projects coming soon...
      </div>
    );
  }

  return (
    <>
      <motion.div variants={textVariant(0.1)}>
        <p className={styles.sectionSubText}>My work</p>
        <h2 className={styles.sectionHeadText}>Projects.</h2>
      </motion.div>

      <div className="w-full flex">
        <motion.p
          variants={fadeIn("up", "spring", 0.1, 1)}
          className="mt-3 text-secondary text-[17px] max-w-3xl leading-[30px]"
        >
          The following projects showcase my skills and experience through
          real-world examples of my work. Each project is briefly described with
          links to code repositories and live demos when available. These
          reflect my ability to solve complex problems, work with different
          technologies, and manage projects effectively.
        </motion.p>
      </div>

      <div className="mt-20 flex flex-wrap gap-7 justify-center">
        {projects.map((project, index) => (
          <ProjectCard
            key={`project-${project.id || index}`} // Use project.id if available
            index={index}
            {...project} // Spread the project data
            source_code_link={project.source_code_link || project.repoUrl} // Use appropriate link field
            live_link={project.live_link || project.demoUrl}
            isExpanded={expandedProject === index}
            onClick={() => handleProjectClick(index)}
          />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Works, "projects");