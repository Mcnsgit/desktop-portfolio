"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { StaticImageData } from "next/image";
import { styles } from "./styles";
import { services } from "../../data/index";
import { SectionWrapper } from "../../hoc";
import { fadeIn, textVariant } from "../../utils/motion";

// Define interfaces
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

// Custom Tilt Component 
const CustomTilt: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  const tiltRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = tiltRef.current;
    if (!element) return;
    
    let tiltSettings = {
      max: 15,      // max tilt rotation (degrees)
      perspective: 1000,  // perspective value
      scale: 1.05,  // scale on hover
      speed: 1000,  // speed of transition
      easing: "cubic-bezier(.03,.98,.52,.99)" // easing for transition
    };
    
    let glareElement: HTMLDivElement | null = null;
    
    // Create glare element
    const addGlare = () => {
      glareElement = document.createElement('div');
      glareElement.className = "glare-effect";
      glareElement.style.position = "absolute";
      glareElement.style.top = "0";
      glareElement.style.left = "0";
      glareElement.style.width = "100%";
      glareElement.style.height = "100%";
      glareElement.style.pointerEvents = "none";
      glareElement.style.background = "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)";
      glareElement.style.transform = "translateX(-100%)";
      glareElement.style.opacity = "0";
      glareElement.style.transition = "transform 0.5s ease, opacity 0.5s ease";
      glareElement.style.zIndex = "10";
      glareElement.style.borderRadius = "20px";
      element.appendChild(glareElement);
    };
    
    addGlare();
    
    // Functions to handle mouse movements
    const updateTransform = (x: number, y: number) => {
      if (!element) return;
      
      // Calculate tilt rotation
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate rotation based on mouse position
      const rotateX = tiltSettings.max * -((y - centerY) / (rect.height / 2));
      const rotateY = tiltSettings.max * ((x - centerX) / (rect.width / 2));
      
      // Apply transform
      element.style.transform = `perspective(${tiltSettings.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${tiltSettings.scale}, ${tiltSettings.scale}, ${tiltSettings.scale})`;
      element.style.transition = `transform 0ms ${tiltSettings.easing}`;
      
      // Update glare position
      if (glareElement) {
        const percentX = (x - rect.left) / rect.width;
        const percentY = (y - rect.top) / rect.height;
        
        // Move glare based on pointer position
        const glarePos = ((percentX + percentY) - 1) * 100; // -100% to 100%
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
      className={`tilt-root ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transform: "perspective(1000px)",
        position: "relative",
        borderRadius: "20px",
        transition: "transform 400ms cubic-bezier(.03,.98,.52,.99)",
        willChange: "transform",
      }}
    >
      <div style={{ transform: "translateZ(20px)" }}>
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
      className="xs:w-[250px] w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CustomTilt className="w-full h-full">
        <div className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card">
          <div className="bg-tertiary rounded-[20px] py-5 px-6 min-h-[280px] flex flex-col justify-between items-center relative">
            {/* Icon with animated container */}
            <div className="w-20 h-20 rounded-full bg-tertiary flex items-center justify-center relative mb-4 overflow-hidden">
              <motion.div
                animate={{
                  y: isHovered ? [0, -4, 0] : 0,
                }}
                transition={{
                  duration: 1.5,
                  repeat: isHovered ? Infinity : 0,
                  repeatType: "loop",
                }}
                className="w-16 h-16 flex items-center justify-center"
              >
                {typeof icon === 'string' ? (
                  <Image
                    src={icon}
                    alt={title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={icon}
                    alt={title}
                    className="w-full h-full object-contain"
                    width={64}
                    height={64}
                  />
                )}
              </motion.div>
              
              {/* Icon glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: isHovered 
                    ? "0 0 15px 2px rgba(255,255,255,0.3)" 
                    : "0 0 0px 0px rgba(255,255,255,0)",
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Title */}
            <div className="text-center mb-4">
              <h3 className="text-white text-[20px] font-bold">{title}</h3>
              {/*... (animated underline).. */}
              <motion.div 
                className="h-[2px] bg-gradient-to-r from-purple-400 to-pink-400 mt-2 mx-auto"
                initial={{ width: "0%" }}
                animate={{ width: isHovered ? "80%" : "0%" }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Description */}
            <motion.p 
              className="text-secondary text-[14px] text-center"
              animate={{
                opacity: isHovered ? 1 : 0.7,
              }}
              transition={{ duration: 0.3 }}
            >
              {description}
            </motion.p>
            
            {/* Corner accents */}
            <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-white opacity-60 rounded-tl" />
            <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-white opacity-60 rounded-tr" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-white opacity-60 rounded-bl" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-white opacity-60 rounded-br" />
          </div>
        </div>
      </CustomTilt>
    </motion.div>
  );
};

const About = () => {
  return (
     <>
      <motion.div variants={textVariant(0.1)}>
         {/* Use styles from ./styles.ts */}
        <p className={styles.sectionSubText}>Introduction</p>
        <h2 className={styles.sectionHeadText}>Overview.</h2>
      </motion.div>

      <motion.p
        variants={fadeIn("up", "spring", 0.1, 1)}
        className="mt-4 text-secondary text-[17px] max-w-3xl leading-[30px]"
      >
        I&apos;m diving into the world of software development with enthusiasm, focusing on JavaScript, Python, React, Node.js, and related technologies. While I&apos;m still relatively new to the field, I genuinely enjoy the constant learning process.
        <br /><br />
        To accelerate my learning and keep up with the rapid pace of technology, I strategically use AI tools. They assist me in planning projects, grasping new concepts, debugging efficiently, and building prototypes faster. This allows me to spend more energy on the creative aspects – drawing from my background in digital marketing and photography to design web experiences that aim to be distinct and engaging, rather than just replicating common patterns.
        <br /><br />
        My focus is always on creating functional, accessible websites that work well for everyone. Living with ADHD has also shaped my problem-solving approach, pushing me towards finding clear, intuitive solutions – much like translating complex ideas across languages, a skill I developed early on. I strive to build digital tools that feel natural and straightforward to use.
      </motion.p>

      <div className="mt-20 flex flex-wrap gap-10 justify-center">
        {/* Ensure services data is correctly typed and mapped */}
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