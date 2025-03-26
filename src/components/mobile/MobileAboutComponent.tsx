import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { styles } from "../cv/styles";
import { services } from "../../data/index";
import { fadeIn } from "../../utils/motion";
import styles2 from "../styles/MobileAbout.module.scss";

// Similar to the ServiceCard but optimized for mobile
const MobileServiceCard = ({ index, title, icon, description }: any) => {
  return (
    <div className={styles2.serviceCard}>
      <div className={styles2.serviceContent}>
        {/* Icon */}
        <div className={styles2.iconContainer}>
          {typeof icon === "string" ? (
            <Image
              src={icon}
              alt={title}
              width={48}
              height={48}
              className={styles2.icon}
            />
          ) : (
            <Image
              src={icon}
              alt={title}
              width={48}
              height={48}
              className={styles2.icon}
            />
          )}
        </div>

        {/* Title */}
        <h3 className={styles2.title}>{title}</h3>

        {/* Description */}
        <p className={styles2.description}>{description}</p>
      </div>
    </div>
  );
};

const MobileAboutComponent = () => {
  return (
    <div className={styles2.container}>
      <h2 className={styles2.sectionHeadText}>Overview</h2>
      <p className={styles2.sectionSubText}>Introduction</p>

      <div className={styles2.introduction}>
        <p>
          I&apos;m a skilled software developer with experience in Python and
          JavaScript, and expertise in frameworks like React, Node.js, and
          Three.js. I&apos;m a quick learner and collaborate closely with
          clients to create efficient, scalable, and user-friendly solutions
          that solve real-world problems.
        </p>
      </div>

      <div className={styles2.servicesContainer}>
        <h3 className={styles2.servicesTitle}>Services</h3>

        {services.map((service, index) => (
          <MobileServiceCard
            key={`${service.title}-${index}`}
            index={index}
            title={service.title}
            icon={service.icon}
            description={
              service.description ||
              `Specialized ${service.title.toLowerCase()} services with expertise in modern technologies and best practices.`
            }
          />
        ))}
      </div>
    </div>
  );
};

export default MobileAboutComponent;
