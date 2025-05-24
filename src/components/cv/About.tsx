"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import { fadeIn, textVariant } from "../../utils/motion";
import { SectionWrapper } from "../../hoc";
import styles from "../styles/About.module.scss";

// Services data (replace with actual imports if needed)
import {backend, creator, mobile, web } from "../../../public/assets/index";

interface ServiceCardProps {
  index: number;
  title: string;
  icon: StaticImageData | string;
  description?: string;
}

interface Service {
  title: string;
  icon: StaticImageData | string;
  description?: string;
}

const CustomTilt: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = tiltRef.current;
    if (!element) return;

    const tiltSettings = {
      maxTilt: 25,
      perspective: 1000,
      speed: 400,
      glare: true,
      glarePrerender: false,
      glareMaxOpacity: 0.45,
      scale: 1.02,
      easing: "cubic-bezier(.03,.98,.52,.99)",
    };

    // Add glare element
    const addGlare = () => {
      const glareElement = document.createElement("div");
      glareElement.className = "glare-effect";
      glareElement.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 20px;
        background: linear-gradient(0deg, 
          rgba(255,255,255,0) 0%, 
          rgba(255,255,255,${tiltSettings.glareMaxOpacity}) 100%);
        pointer-events: none;
        opacity: 0;
        transform: translateX(-100%);
        transition: transform 0.6s cubic-bezier(.03,.98,.52,.99), opacity 0.6s cubic-bezier(.03,.98,.52,.99);
      `;
      element.appendChild(glareElement);
      return glareElement;
    };

    const glareElement = tiltSettings.glare ? addGlare() : null;

    const updateTransform = (x: number, y: number) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const rotateX = ((y - centerY) / (rect.height / 2)) * tiltSettings.maxTilt;
      const rotateY = ((centerX - x) / (rect.width / 2)) * tiltSettings.maxTilt;

      element.style.transform = `perspective(${tiltSettings.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${tiltSettings.scale}, ${tiltSettings.scale}, ${tiltSettings.scale})`;
      element.style.transition = '';

      // Update glare position
      if (glareElement) {
        const glarePos = ((x - rect.left) / rect.width) * 100;
        glareElement.style.transform = `translateX(${glarePos}%)`;
        glareElement.style.opacity = "1";
      }
    };
    
    const resetTransform = () => {
      if (!element) return;
      
      // Reset transform when mouse leaves
      element.style.transform = `perspective(${tiltSettings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      element.style.transition = `transform ${tiltSettings.speed}ms ${tiltSettings.easing}`;
      
      // Reset glare
      if (glareElement) {
        glareElement.style.opacity = "0";
        glareElement.style.transform = "translateX(-100%)";
      }
    };

    // Event handlers
    const handleMouseMove = (e: MouseEvent) => {
      updateTransform(e.clientX, e.clientY);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      // Start transition when mouse enters
      updateTransform(e.clientX, e.clientY);
    };

    const handleMouseLeave = () => {
      resetTransform();
    };

    // Add event listeners
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Clean up
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      
      if (glareElement && element.contains(glareElement)) {
        element.removeChild(glareElement);
      }
    };
  }, []);

  return (
    <div 
      ref={tiltRef} 
      className={`${styles.tiltRoot} ${className}`}
    >
      <div className={styles.tiltContent}>
        {children}
      </div>
    </div>
  );
};

const ServiceCard: React.FC<ServiceCardProps> = ({
  index,
  title,
  icon,
  description
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      variants={fadeIn("right", "spring", index * 0.5, 0.75)}
      className={styles.serviceCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CustomTilt className={styles.serviceCardTilt}>
        <div className={styles.serviceCardGradient}>
          <div className={styles.serviceCardContent}>
            {/* Icon with animated container */}
            <div className={styles.serviceIconContainer}>
              <motion.div
                animate={{
                  y: isHovered ? [0, -4, 0] : 0,
                }}
                transition={{
                  duration: 1.5,
                  repeat: isHovered ? Infinity : 0,
                  repeatType: "loop",
                }}
                className={styles.serviceIconInner}
              >
                {typeof icon === 'string' ? (
                  <Image
                    src={icon}
                    alt={title}
                    className={styles.serviceIcon}
                  />
                ) : (
                  <Image
                    src={icon}
                    alt={title}
                    className={styles.serviceIcon}
                    width={64}
                    height={64}
                  />
                )}
              </motion.div>
              
              {/* Icon glow effect */}
              <motion.div
                className={styles.serviceIconGlow}
                animate={{
                  boxShadow: isHovered 
                    ? "0 0 15px 2px rgba(255,255,255,0.3)" 
                    : "0 0 0px 0px rgba(255,255,255,0)",
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Title */}
            <div className={styles.serviceTitle}>
              <h3>{title}</h3>
              <motion.div 
                className={styles.serviceTitleUnderline}
                initial={{ width: "0%" }}
                animate={{ width: isHovered ? "80%" : "0%" }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Description */}
            <motion.p 
              className={styles.serviceDescription}
              animate={{
                opacity: isHovered ? 1 : 0.7,
              }}
              transition={{ duration: 0.3 }}
            >
              {description}
            </motion.p>
            
            {/* Corner accents */}
            <div className={`${styles.cornerAccent} ${styles.topLeft}`} />
            <div className={`${styles.cornerAccent} ${styles.topRight}`} />
            <div className={`${styles.cornerAccent} ${styles.bottomLeft}`} />
            <div className={`${styles.cornerAccent} ${styles.bottomRight}`} />
          </div>
        </div>
      </CustomTilt>
    </motion.div>
  );
};

// Services data
const services: Service[] = [
  {
    title: "Web Developer",
    icon: web,
    description: "Modern responsive websites using latest technologies",
  },
  {
    title: "React Native Developer",
    icon: mobile,
    description: "Cross-platform mobile applications",
  },
  {
    title: "Backend Developer",
    icon: backend,
    description: "Robust server-side solutions and APIs",
  },
  {
    title: "Content Creator",
    icon: creator,
    description: "Engaging digital content and experiences",
  },
];

const About = () => {
  return (
     <>
      <motion.div variants={textVariant(0.1)}>
        <p className={styles.sectionSubText}>Introduction</p>
        <h2 className={styles.sectionHeadText}>Overview.</h2>
      </motion.div>

      <motion.p
        variants={fadeIn("up", "spring", 0.1, 1)}
        className={styles.aboutDescription}
      >
        I&apos;m diving into the world of software development with enthusiasm, focusing on JavaScript, Python, React, Node.js, and related technologies. While I&apos;m still relatively new to the field, I genuinely enjoy the constant learning process.
        <br /><br />
        To accelerate my learning and keep up with the rapid pace of technology, I strategically use AI tools. They assist me in planning projects, grasping new concepts, debugging efficiently, and building prototypes faster. This allows me to spend more energy on the creative aspects – drawing from my background in digital marketing and photography to design web experiences that aim to be distinct and engaging, rather than just replicating common patterns.
        <br /><br />
        My focus is always on creating functional, accessible websites that work well for everyone. Living with ADHD has also shaped my problem-solving approach, pushing me towards finding clear, intuitive solutions – much like translating complex ideas across languages, a skill I developed early on. I strive to build digital tools that feel natural and straightforward to use.
      </motion.p>

      <div className={styles.servicesContainer}>
        {services.map((service: Service, index) => (
          <ServiceCard
            key={`${service.title}-${index}`}
            index={index}
            {...service}
          />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(About, "about");