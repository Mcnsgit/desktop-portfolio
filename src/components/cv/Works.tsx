"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
// import Link from "next/link";
import { SectionWrapper } from "../../hoc";
import { styles as globalStyles } from "./styles"; // Global styles
import localStyles from "./Works.module.scss"; // Local SCSS module
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
      className={localStyles.projectCard}
      onClick={onClick}
      whileHover={{ y: -5 }} // This can be kept or moved to SCSS :hover
    >
      <div className={localStyles.imageContainer}>
        {typeof image === "string" ? (
          <Image
            src={image || "/placeholder.jpg"}
            alt={name}
            className={localStyles.projectImage}
            width={360}
            height={230}
            unoptimized // If image is external and not optimized by Next.js
          />
        ) : (
          <Image
            width={360}
            height={230}
            src={image}
            alt={name}
            className={localStyles.projectImage}
          />
        )}

        <div className={localStyles.linksOverlay}>
          {source_code_link && (
            <div
              className={localStyles.iconLink} 
              onClick={(e) => {
                e.stopPropagation();
                window.open(source_code_link, "_blank", "noopener,noreferrer");
              }}
              title="View Source Code"
            >
              <GithubLogo /> {/* Icon size will be controlled by SCSS */}
            </div>
          )}

          {live_link && (
            <div
              className={`${localStyles.iconLink} ${localStyles.arrowIcon}`} // Added arrowIcon for specific sizing if needed
              onClick={(e) => {
                e.stopPropagation();
                window.open(live_link, "_blank", "noopener,noreferrer");
              }}
              title="View Live Demo"
            >
              <ArrowSquareOut /> {/* Icon size will be controlled by SCSS */}
            </div>
          )}
        </div>
      </div>

      <div className={localStyles.contentContainer}>
        <h3 className={localStyles.projectName}>{name}</h3>
        <p className={localStyles.projectDescriptionShort}>
          {description}
        </p>
      </div>

      <div className={localStyles.tagsContainer}>
        {tags.map((tag) => (
          <span
            key={`${name}-${tag.name}`}
            // Apply dynamic color via inline style, SCSS handles base styling
            className={`${localStyles.tag} ${tag.color ? '' : 'text-white'}` } 
            style={tag.color && !tag.color.startsWith('text-') ? { backgroundColor: tag.color, color: 'white' } : {}}
          >
            #{tag.name}
          </span>
        ))}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={localStyles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); onClick();}} // Close modal on overlay click
          >
            <motion.div
              className={localStyles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
            >
              <div className={localStyles.modalImageContainer}>
                {typeof image === "string" ? (
                  <Image
                    src={image || "/placeholder.jpg"} // Fallback image
                    alt={name}
                    className={localStyles.modalImage}
                    width={800}
                    height={300}
                    unoptimized
                  />
                ) : (
                  <Image
                    width={800}
                    height={300}
                    src={image} // Fallback image for StaticImageData needed if it can be null/undefined
                    alt={name}
                    className={localStyles.modalImage}
                  />
                )}
                <button
                  className={localStyles.modalCloseButton}
                  onClick={onClick} // This should call the passed onClick to toggle isExpanded
                >
                  <X size={24} />
                </button>
              </div>

              <div className={localStyles.modalDetailsContainer}>
                <h2 className={localStyles.modalProjectName}>
                  {name}
                </h2>
                <p className={localStyles.modalProjectDescription}>{description}</p>

                <div className={localStyles.modalTechHeaderContainer}> {/* Changed to modalTechHeaderContainer */}
                  <h3 className={localStyles.modalTechHeader}>
                    Technologies
                  </h3>
                  <div className={localStyles.modalTagsContainer}>
                    {tags.map((tag) => (
                      <span
                        key={`modal-${name}-${tag.name}`}
                        className={`${localStyles.tag} ${tag.color ? '' : 'text-white'}`}
                        style={tag.color && !tag.color.startsWith('text-') ? { backgroundColor: tag.color, color: 'white' } : {}}
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={localStyles.modalLinksContainer}>
                  {source_code_link && (
                    <a
                      href={source_code_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${localStyles.modalLinkButton} ${localStyles.github}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GithubLogo size={20} /> View Code
                    </a>
                  )}

                  {live_link && (
                    <a
                      href={live_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${localStyles.modalLinkButton} ${localStyles.liveDemo}`}
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

  if (!projects || projects.length === 0) {
    console.warn("Works component: No project data found.");
    return (
      <div className={localStyles.noProjectsMessage}>
        Projects coming soon...
      </div>
    );
  }

  return (
    <>
      <motion.div variants={textVariant(0.1)}>
        <p className={globalStyles.sectionSubText}>My work</p>
        <h2 className={globalStyles.sectionHeadText}>Projects.</h2>
      </motion.div>

      <div className={localStyles.introContainer}>
        <motion.p
          variants={fadeIn("up", "spring", 0.1, 1)}
          className={localStyles.introParagraph}
        >
          The following projects showcase my skills and experience through
          real-world examples of my work. Each project is briefly described with
          links to code repositories and live demos when available. These
          reflect my ability to solve complex problems, work with different
          technologies, and manage projects effectively.
        </motion.p>
      </div>

      <div className={localStyles.projectsContainer}>
        {projects.map((project, index) => (
          <ProjectCard
            key={`project-${project.id || index}`} 
            index={index}
            {...project} 
            source_code_link={project.source_code_link || project.repoUrl} 
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