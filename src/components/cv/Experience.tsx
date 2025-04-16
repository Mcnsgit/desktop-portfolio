"use client"

import React from 'react';
import { VerticalTimeline, VerticalTimelineElement} from 'react-vertical-timeline-component';
import { motion} from "framer-motion";
import Image,{ StaticImageData } from "next/image";

import "react-vertical-timeline-component/style.min.css"

import { styles} from './styles';
import { experiences } from '@/data';
import { SectionWrapper } from '@/hoc';
import { textVariant } from '@/utils/motion';

interface Experience {
  title: string;
  company_name?: string;
  icon?: StaticImageData | string;
  icongBg?: string;
  date: string;
  points: string[];
}

const ExperienceCard: React.FC<{experience: Experience}> = ({experience}) => {
  return(
    <VerticalTimelineElement
    contentStyle={{ background: "#1d1836", color: '#fff', boxShadow: "0 3px 10px rgba(0,0,0,0.2"}}
    contentArrowStyle={{ borderRight:"7px solid #232631"}}
    date={experience.date}
    iconStyle={{ background: experience.icongBg}}
    icon={<div className='flex justify-centeritems-center w-full h-full'>
      {/* Use Next Image compoent*/}
      {experience.icon && (
        <Image 
          src={experience.icon}
          alt={experience.company_name || "Company logo"}
          className='w-[60%] h=[60%] object-contain'
          width={36}
          height={36}
        />
      )}
      
    </div>
    }
    >
      <div>
        <h3 className='text-white text-[24px] font-bold'>{experience.title}</h3>
        <p className='text-secondary text-[16px] font-semibold' style={{ margin:0}}>
          {experience.company_name}
        </p>
      </div>

      <ul className='mt-5 lst-disc ml-5 space-y-2'>
        {experience.points.map((point, index) => (
          <li
            key={`experience-point-${index}`}
            className='text-white-100 text-[14px] pl-1 tracking-wider'
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
    <>
    <motion.div variants={textVariant(0.1)}>
        <p className={`${styles.sectionSubText} text-center`}>
          What I have done so far
        </p>
        <h2 className={`${styles.sectionHeadText} text-center`}>
          Work Experience.
        </h2>
      </motion.div>

      <div className='mt-20 flex flex-col'>
        <VerticalTimeline lineColor="#232631"> {/* Optional: Set line color */}
          {experiences.map((experience, index) => (
            <ExperienceCard
              key={`experience-${index}`}
              experience={experience}
            />
          ))}
        </VerticalTimeline>
      </div>
    </>
  );
};

// Export wrapped component
export default SectionWrapper(Experience, "work"); // Use "work" as id for navigation