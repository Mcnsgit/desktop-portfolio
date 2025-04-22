// src/components/windows/WindowTypes/AboutWindow.tsx
import React from "react";
import styles from "../../styles/AboutWindow.module.scss";
import Image from "next/image";

const AboutWindow: React.FC = () => {
  return (
    <div className={styles.aboutWindow}>
      <div className={styles.profile}>
        {/* Fixed image path and added error handling */}
        <div className={styles.profileImageWrapper}>
          <div className={styles.profileImageFallback}>
            MC
          </div>
        </div>
        <h2>Miguel Cardiga</h2>
        <p className={styles.title}>Full Stack Developer</p>
      </div>

      <div className={styles.section}>
        <h3>About Me</h3>
        <p>
          Hello! I&apos;m a passionate web developer with expertise in building
          modern, responsive web applications. I enjoy solving complex problems
          and creating intuitive user experiences.
        </p>
      </div>

      <div className={styles.section}>
        <h3>Skills</h3>
        <div className={styles.skillContainer}>
          <div className={styles.skillCategory}>
            <h4>Frontend</h4>
            <ul className={styles.skillList}>
              <li>React.js</li>
              <li>TypeScript</li>
              <li>HTML/CSS</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>

          <div className={styles.skillCategory}>
            <h4>Backend</h4>
            <ul className={styles.skillList}>
              <li>Node.js</li>
              <li>Python</li>
              <li>MongoDB</li>
              <li>MySQL</li>
            </ul>
          </div>

          <div className={styles.skillCategory}>
            <h4>Tools</h4>
            <ul className={styles.skillList}>
              <li>Git</li>
              <li>Docker</li>
              <li>CI/CD</li>
              <li>VS Code</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p>
          This portfolio was built with Next.js and styled to resemble a retro
          operating system.
        </p>
      </div>
    </div>
  );
};

export default AboutWindow;