import React, { useState, useEffect } from "react";
import { useDesktop } from "../../context/DesktopContext";
import styles from "../styles/MobileView.module.scss";
import Image from "next/image";
import { useSounds } from "@/hooks/useSounds";
import LoadingScreen from "../3d/LoadingScreen";
import DefaultIconImage from "../../../public/assets/win98-icons/png/directory_closed_history-2.png";
import CodeIconImage from "../../../public/assets/win98-icons/png/file_lines-0.png";
import VisualIconImage from "../../../public/assets/win98-icons/png/camera-0.png";
import InteractiveIconImage from "../../../public/assets/win98-icons/png/joystick-0.png";
import AboutMeIconImage from "../../../public/assets/win98-icons/png/address_book_user.png";
import SkillsIconImage from "../../../public/assets/win98-icons/png/computer_explorer-0.png";
import ContactIconImage from "../../../public/assets/win98-icons/png/msn3-4.png";
import ImageWithFallback from "@/utils/ImageWithFallback";

const MobileView: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const { playSound } = useSounds();
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Load mobile view with a loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      playSound("startup");
    }, 1500);

    return () => clearTimeout(timer);
  }, [playSound]);

  const handleProjectClick = (projectId: string) => {
    playSound("click");

    // Find the project
    const project = state.projects.find((p) => p.id === projectId);
    if (project) {
      console.log("Opening project in mobile view:", project.title);

      // Open the project in a "mobile window" - pass the ID, not the content
      dispatch({
        type: "OPEN_WINDOW",
        payload: {
          id: `project-${project.id}`,
          title: project.title,
          content: project.id, // Pass the ID as content
          minimized: false,
          position: { x: 0, y: 0 }, // Full screen on mobile
          type: "project",
        },
      });
    }
  };

  // Check if any windows are open to hide the main view
  const hasOpenWindows = state.windows.some((w) => !w.minimized);

  // Only show the mobile main view if no windows are open
  if (hasOpenWindows) {
    return null; // The MobileWindowManager will handle rendering the window
  }

  const openAboutMe = () => {
    playSound("click");
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: "about",
        title: "About Me",
        content: "about",
        minimized: false,
        position: { x: 0, y: 0 },
        type: "about",
      },
    });
  };

  const openContact = () => {
    playSound("click");
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: "contact",
        title: "Contact",
        content: "contact",
        minimized: false,
        position: { x: 0, y: 0 },
        type: "contact",
      },
    });
  };

  const openSkills = () => {
    playSound("click");
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: "skills",
        title: "Technical Skills",
        content: { type: "skills" },
        minimized: false,
        position: { x: 0, y: 0 },
        type: "skills",
      },
    });
  };

  // Group projects by type for better organization
  const projectsByType: Record<string, typeof state.projects> = {
    code: state.projects.filter((p) => p.type === "code"),
    visual: state.projects.filter((p) => p.type === "visual"),
    interactive: state.projects.filter((p) => p.type === "interactive"),
  };

  // Get appropriate icon based on project type
  const getProjectIcon = (type: string) => {
    switch (type) {
      case "code":
        return CodeIconImage;
      case "visual":
        return VisualIconImage;
      case "interactive":
        return InteractiveIconImage;
      default:
        return DefaultIconImage;
    }
  };

  const toggleCategory = (category: string) => {
    playSound("click");
    setActiveCategory((currentCategory) =>
      currentCategory === category ? null : category
    );
  };

  if (loading) {
    return (
      <LoadingScreen
        show={loading}
        onComplete={() => setLoading(false)}
        message="Loading Mobile RetroOS..."
        delay={2000}
      />
    );
  }

  return (
    <div className={styles.mobileView}>
      <div className={styles.header}>
        <div className={styles.windowHeader}>
          <div className={styles.windowTitle}>RetroOS Portfolio</div>
          <div className={styles.windowControls}>
            <span className={styles.minimizeButton}></span>
            <span className={styles.maximizeButton}></span>
            <span className={styles.closeButton}></span>
          </div>
        </div>
      </div>

      <div className={styles.menuBar}>
        <button onClick={openAboutMe}>About</button>
        <button onClick={openSkills}>Skills</button>
        <button onClick={openContact}>Contact</button>
      </div>

      <div className={styles.mainIcons}>
        <div className={styles.iconGrid}>
          <div className={styles.iconItem} onClick={openAboutMe}>
            <div className={styles.iconWrapper}>
              <ImageWithFallback
                src={AboutMeIconImage}
                width={32}
                height={32}
                alt="About Me"
              />
            </div>
            <span>About Me</span>
          </div>

          <div className={styles.iconItem} onClick={openSkills}>
            <div className={styles.iconWrapper}>
              <ImageWithFallback
                src={SkillsIconImage}
                width={32}
                height={32}
                alt="Skills"
              />
            </div>
            <span>Skills</span>
          </div>

          <div className={styles.iconItem} onClick={openContact}>
            <div className={styles.iconWrapper}>
              <ImageWithFallback
                src={ContactIconImage}
                width={32}
                height={32}
                alt="Contact"
              />
            </div>
            <span>Contact</span>
          </div>
        </div>
      </div>

      <div className={styles.projectSection}>
        <h2>Projects</h2>

        {Object.entries(projectsByType).map(([type, projects]) => (
          <div key={type} className={styles.projectCategory}>
            <div
              className={styles.categoryHeader}
              onClick={() => toggleCategory(type)}
            >
              <h3>
                <ImageWithFallback
                  src={getProjectIcon(type)}
                  width={20}
                  height={20}
                  alt={type}
                  className={styles.categoryIcon}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)} Projects (
                {projects.length})
              </h3>
              <span
                className={
                  activeCategory === type ? styles.arrowUp : styles.arrowDown
                }
              >
                {activeCategory === type ? "▲" : "▼"}
              </span>
            </div>

            {activeCategory === type && (
              <div className={styles.projectGrid}>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={styles.projectCard}
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className={styles.projectCardContent}>
                      <div className={styles.projectIcon}>
                        <ImageWithFallback
                          src={
                            project.icon
                              ? project.icon
                              : getProjectIcon(project.type)
                          }
                          alt={project.title}
                          width={24}
                          height={24}
                        />
                      </div>
                      <h3>{project.title}</h3>
                    </div>
                    <p>
                      {project.description
                        ? project.description.slice(0, 70) + "..."
                        : "No description available"}
                    </p>
                    <div className={styles.projectTech}>
                      {project.technologies &&
                        project.technologies.slice(0, 3).map((tech, index) => (
                          <span key={index} className={styles.techBadge}>
                            {tech}
                          </span>
                        ))}
                      {project.technologies &&
                        project.technologies.length > 3 && (
                          <span className={styles.techBadge}>
                            +{project.technologies.length - 3}
                          </span>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p>RetroOS Portfolio © {new Date().getFullYear()}</p>
        <div className={styles.statusBar}>
          <div className={styles.statusItem}>Memory: 8MB</div>
          <div className={styles.statusItem}>CPU: 66MHz</div>
        </div>
      </div>
    </div>
  );
};

export default MobileView;
