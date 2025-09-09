"use client"

import React from 'react';
import { VerticalTimeline, VerticalTimelineElement} from 'react-vertical-timeline-component';
import { motion} from "framer-motion";
import Image,{ StaticImageData } from "next/image";

import "react-vertical-timeline-component/style.min.css"

import { styles as globalStyles } from './styles';
import localStyles from './Experience.module.scss';
import { experiences } from '@/config/index';
import { SectionWrapper } from '@/hoc';
import { textVariant } from '@/utils/motion';

interface Experience {
  title: string;
  company_name?: string;
  icon?: StaticImageData | string;
  iconBg?: string;
  date: string;
  points: string[];
}

const ExperienceCard: React.FC<{experience: Experience}> = ({experience}) => {
  return(
    <VerticalTimelineElement
    contentStyle={{ background: "#1d1836", color: '#fff', boxShadow: "0 3px 10px rgba(0,0,0,0.2)"}}
    contentArrowStyle={{ borderRight:"7px solid #232631"}}
    date={experience.date}
    iconStyle={{ background: experience.iconBg}}
    icon={<div className={localStyles.iconContainer}>
      {/* Use Next Image compoent*/}
      {experience.icon && (
        <Image 
          src={experience.icon}
          alt={experience.company_name || "Company logo"}
          className={localStyles.iconImage}
          width={36}
          height={36}
        />
      )}
      
    </div>
    }
    >
      <div>
        <h3 className={localStyles.title}>{experience.title}</h3>
        <p className={localStyles.companyName} style={{ margin:0}}>
          {experience.company_name}
        </p>
      </div>

      <ul className={localStyles.pointsList}>
        {experience.points.map((point, index) => (
          <li
            key={`experience-point-${index}`}
            className={localStyles.pointItem}
          >
            {point}
          </li>
        ))}
      </ul>
    </VerticalTimelineElement>
  )
};

const Experience = () => {
  return (
    <div className={localStyles.experienceSection}>
      <motion.div variants={textVariant(0.1)}>
        <p className={`${globalStyles.sectionSubText} ${localStyles.sectionSubText}`}>
          What I have done so far
        </p>
        <h2 className={`${globalStyles.sectionHeadText} ${localStyles.sectionHeadText}`}>
          Work Experience
        </h2>
      </motion.div>

      <div className={`${localStyles.timelineContainer} ${localStyles.customTimelineLine}`}>
        <VerticalTimeline lineColor="#232631">
          {experiences.map((experience, index) => (
            <ExperienceCard
              key={`experience-${index}`}
              experience={experience}
            />
          ))}
        </VerticalTimeline>
      </div>
    </div>
  );
};

// Export wrapped component
export default SectionWrapper(Experience, "work"); // Use "work" as id for navigation