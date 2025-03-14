// components/MobileView.tsx
import React from 'react';
import { useDesktop } from '../context/DesktopContext';
import styles from './styles/MobileView.module.scss';
import Image from 'next/image';

const MobileView: React.FC = () => {
  const { state, dispatch } = useDesktop();
  
  const handleProjectClick = (projectId: string) => {
    // Find the project
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      // Open the project in a "mobile window"
      dispatch({
        type: 'OPEN_WINDOW',
        payload: {
          id: `project-${project.id}`,
          title: project.title,
          content: project.content,
          minimized: false,
          position: { x: 0, y: 0 }, // Full screen on mobile
        }
      });
    }
  };
  
  const openAboutMe = () => {
    dispatch({
      type: 'OPEN_WINDOW',
      payload: {
        id: 'about',
        title: 'About Me',
        content: 'about',
        minimized: false,
        position: { x: 0, y: 0 },
      }
    });
  };
  const defaultProjectIcon = "/assets/win98-icons/png/directory_closed_history-2.png"
  
  return (
    <div className={styles.mobileView}>
      <div className={styles.header}>
        <h1>RetroOS Portfolio</h1>
      </div>
      
      <div className={styles.projectGrid}>
        <div 
          className={styles.projectCard}
          onClick={openAboutMe}
        >
          <Image src="/assets/win98-icons/png/address_book_user.png" width={24} height={24} alt="About Me" className={styles.projectIcon} />
          <h3>About Me</h3>
          <p>Learn more about who I am</p>
        </div>
        
        {state.projects.map(project => (
          <div 
            key={project.id}
            className={styles.projectCard}
            onClick={() => handleProjectClick(project.id)}
          >
            <Image src={defaultProjectIcon} alt={project.title} width={24} height={24} className={styles.projectIcon} />
            <h3>{project.title}</h3>
            <p>{project.description.slice(0, 50)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileView;