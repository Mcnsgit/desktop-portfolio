"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { SectionWrapper } from "../../hoc";
import { styles } from "./styles";
import { projects } from "../../data/index";
import { fadeIn, textVariant } from "../../utils/motion";
import { GithubLogo, ArrowSquareOut } from "@phosphor-icons/react";
import { StaticImageData } from "next/image";

interface ProjectCardProps {
  index: number;
  name: string;
  description: string;
  tags: Array<{ name: string; color: string }>;
  image: string | StaticImageData;
  source_code_link: string;
  live_link?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  index,
  name,
  description,
  tags,
  image,
  source_code_link,
  live_link,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={fadeIn("up", "spring", index * 0.5, 0.75)}
      className="bg-tertiary p-5 rounded-2xl sm:w-[360px] w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-[230px] overflow-hidden rounded-2xl">
        {typeof image === "string" ? (
          <Image
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            width={360}
            height={230}
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
          />
        ) : (
          <Image
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
          />
        )}

        {/* Project Links */}
        <div className="absolute inset-0 flex items-end justify-end gap-2 m-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
          {/* GitHub Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              window.open(source_code_link, "_blank", "noopener,noreferrer");
            }}
            title="View Source Code"
          >
            <GithubLogo className="w-1/2 h-1/2 text-white" />
          </motion.div>

          {/* Live Demo Link (if available) */}
          {live_link && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                window.open(live_link, "_blank", "noopener,noreferrer");
              }}
              title="View Live Demo"
            >
              <ArrowSquareOut className="w-1/3 h-1/3 text-white" />
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-white font-bold text-[24px]">{name}</h3>
        <p className="mt-2 text-secondary text-[14px]">{description}</p>
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

      {/* Hover reveal overlay */}
      <motion.div
        className="absolute inset-0 bg-tertiary/80 backdrop-blur-sm rounded-2xl flex items-center justify-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ pointerEvents: isHovered ? "auto" : "none" }}
      >
        <div className="text-center">
          <h3 className="text-white font-bold text-[24px] mb-4">{name}</h3>
          <p className="text-white text-[16px]">{description}</p>

          <div className="mt-6 flex justify-center gap-4">
            <a
              href={source_code_link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors duration-300"
            >
              <GithubLogo /> View Code
            </a>

            {live_link && (
              <a
                href={live_link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-white/80 text-primary px-4 py-2 rounded-md flex items-center gap-2 transition-colors duration-300"
              >
                <ArrowSquareOut /> Live Demo
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Works = () => {
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
            key={`project-${index}`}
            index={index}
            name={project.name}
            description={project.description}
            tags={project.tags}
            image={project.image || "/placeholder.jpg"}
            source_code_link={project.source_code_link}
            live_link={project.live_link}
          />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Works, "projects");
