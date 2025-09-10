// src/components/windows/WindowTypes/AboutWindow.tsx
import React from "react";
import styles from "./AboutWindow.module.scss";
import Image from "next/image";

const AboutWindow: React.FC = () => {
  return (
    <div className={styles.aboutWindow}>
      <header className={styles.header}>
        <div className={styles.profileImageContainer}>
          <Image 
            src="/assets/profile-pic.jpg" 
            alt="Miguel's Profile Picture" 
            width={120} 
            height={120}
            className={styles.profileImage}
            priority
          />
        </div>
        <div className={styles.headerText}>
          <h1>Miguel Angel</h1>
          <h2>Software Engineer & Full-Stack Developer</h2>
        </div>
      </header>
      <main className={styles.content}>
        <section>
          <h3>About Me</h3>
          <p>
            I am a dedicated and passionate software engineer with a strong foundation in both front-end and back-end development. 
            My journey in tech is driven by a love for creative problem-solving and building beautiful, high-performance applications.
          </p>
          <p>
            This portfolio is a demonstration of that passion—a fully interactive, retro-themed desktop environment built from the ground up
            with modern technologies like React, Next.js, and TypeScript. Feel free to explore, open applications, and see what&apos;s possible!
          </p>
        </section>
        <section>
          <h3>Technical Philosophy</h3>
          <p>
            I believe in writing clean, maintainable, and well-documented code. My approach emphasizes a strong architectural foundation,
            separating concerns to ensure scalability and ease of testing. I am always exploring new technologies and patterns to continuously
            improve my craft.
          </p>
        </section>
      </main>
      <footer className={styles.footer}>
        <p>Built with ❤️ using Next.js, React, and TypeScript.</p>
      </footer>
    </div>
  );
};

export default AboutWindow;