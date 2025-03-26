import React from "react";
import styles from "../styles/MobileWindow.module.scss";
import { useDesktop } from "../../context/DesktopContext";
import { useSounds } from "@/hooks/useSounds";
import { Project, Window } from "@/types/index";
import MobileAboutComponent from "./MobileAboutComponent";
import MobileSkillsComponent from "./MobileSkillsComponent";
import MobileContactComponent from "./MobileContactComponent";
import ImageWithFallback from "../../utils/ImageWithFallback";
import ProjectWindow from "../windows/WindowTypes/ProjectWindow";

interface MobileWindowProps {
  window: Window;
}

const MobileWindow: React.FC<MobileWindowProps> = ({ window }) => {
  const { dispatch, state } = useDesktop();
  const { playSound } = useSounds();

  const handleClose = () => {
    playSound("windowClose");
    dispatch({
      type: "CLOSE_WINDOW",
      payload: { id: window.id },
    });
  };

  // Determine content based on window type and content key
  const renderContent = () => {
    // Special case for project windows
    if (window.id.startsWith("project-")) {
      const projectId = window.id.replace("project-", "");
      const project = state.projects.find((p) => p.id === projectId);

      if (project) {
        console.log("Rendering project in mobile window:", project.title);
        return <ProjectWindow project={project} />;
      }
    }

    // Handle standard content types
    if (typeof window.content === "string") {
      if (window.content === "about") {
        return <MobileAboutComponent />;
      } else if (window.content === "skills") {
        return <MobileSkillsComponent />;
      } else if (window.content === "contact") {
        return <MobileContactComponent />;
      } else {
        // This could be a project ID
        const projectId = window.content;
        const project = state.projects.find((p) => p.id === projectId);

        if (project) {
          console.log("Rendering project from content string:", project.title);
          return <ProjectWindow project={project} />;
        }

        // If not a project, show placeholder
        return (
          <div className={styles.placeholderContent}>
            <p>This content is coming soon! (Content key: {window.content})</p>
          </div>
        );
      }
    }

    // Handle object-type content
    else if (window.content && typeof window.content === "object") {
      if (window.type === "project" && "id" in window.content) {
        // It's a project object
        return <ProjectWindow project={window.content as unknown as Project} />;
      } else {
        // Generic object content
        return (
          <div className={styles.genericContent}>
            {window.content.toString &&
            typeof window.content.toString === "function"
              ? window.content.toString()
              : "Content cannot be displayed"}
          </div>
        );
      }
    }

    // Fallback
    return (
      <div className={styles.placeholderContent}>
        <p>No content available for this window.</p>
      </div>
    );
  };

  return (
    <div className={styles.mobileWindow}>
      <div className={styles.windowHeader}>
        <div className={styles.windowTitle}>{window.title}</div>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close window"
        >
          ✕
        </button>
      </div>

      <div className={styles.windowContent}>{renderContent()}</div>

      <div className={styles.windowFooter}>
        <button onClick={handleClose} className={styles.backButton}>
          Back to Main Menu
        </button>
      </div>
    </div>
  );
};

export default MobileWindow;
