// components/windows/WindowTypes/ProjectWindow.tsx
import React from 'react';
import { Project } from '../../types/project';
import styles from './ProjectWindow.module.scss';
// import { Github, Globe } from 'lucide-react';
import Image from 'next/image';

interface ProjectWindowProps {
  project: Project;
}

const ProjectWindow: React.FC<ProjectWindowProps> = ({ project }) => {
  // Render content based on project type
  const renderContent = () => {
    switch (project.type) {
      case 'code':
        return (
          <div className={styles.codeProject}>
            <div className={styles.description}>{project.description}</div>
            <div className={styles.technologies}>
              {(project.technologies ?? []).map((tech: string)  => (
                <span key={tech} className={styles.tag}>{tech}</span>
              ))}
            </div>
            <div className={styles.codeContainer}>
              {/* Code display with syntax highlighting */}
              {project.content}
            </div>
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                View Source Code
              </a>
            )}
          </div>
        );
      
      case 'visual':
        return (
          <div className={styles.visualProject}>
            <div className={styles.description}>{project.description}</div>
            <div className={styles.imageContainer}>
              <Image 
                src={project.image as string} 
                alt={`${project.title} screenshot`}
                width={500} // Example width, adjust as needed
                height={300} // Example height, adjust as needed
                style={{ objectFit: 'contain' }} // Maintain aspect ratio
                className={styles.projectImage} 
              />
            </div>
          </div>
        );
      
      case 'interactive':
        return (
          <div className={styles.interactiveProject}>
            <div className={styles.description}>{project.description}</div>
            <div className={styles.demoContainer}>
              {/* Interactive demo */}
              {project.content}
            </div>
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                Open Full Demo
              </a>
            )}
          </div>
        );
      
      default:
        return <div>{project.description}</div>;
    }
  };
  
  return (
    <div className={styles.projectWindow}>
      <div className={styles.header}>
        <h2>{project.title}</h2>
      </div>
      {renderContent()}
    </div>
  );
};

export default ProjectWindow;