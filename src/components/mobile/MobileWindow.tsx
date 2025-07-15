// import React from "react";
// import styles from "../styles/MobileWindow.module.scss";
// import { useSounds } from "@/hooks/useSounds";
// import MobileAboutComponent from "./MobileAboutComponent";
// import MobileSkillsComponent from "./MobileSkillsComponent";
// import MobileContactComponent from "./MobileContactComponent";
// import ProjectWindow from "../content/ProjectWindow";
// import { Window } from "@/types/window";
// import { Desktop } from "@/types/desktop";
// import { WINDOW_TYPES } from "@/utils/constants/windowConstants";
// import { useLocalStorage } from "@/hooks/useLocalStorage";

// interface MobileWindowProps {
//   window: Window;
//   desktopModel: Desktop;
// }

// const MobileWindow: React.FC<MobileWindowProps> = ({ window, desktopModel }) => {
//   const { playSound } = useSounds();
//   const [windowManager] = useLocalStorage("windowManager", {});
//   const handleClose = () => {
//     playSound("windowClose");
//     windowManager.closeWindow(window.id);
//   };

//   const renderContent = () => {
//     // The 'content' property on the new WindowModel holds the payload
//     const { content } = window; 
    
//     // Check if content is an object and has a 'type' property
//     if (content && typeof content === 'object' && 'type' in content) {
//       switch (content.type) {
//         case WINDOW_TYPES.PROJECT:
//           if (content.projectId) {
//             const project = desktopModel.getProjectById(content.projectId);
//             if (project) {
//               return <ProjectWindow project={project} />;
//             }
//           }
//           break;
//         case WINDOW_TYPES.ABOUT:
//           return <MobileAboutComponent />;
//         case WINDOW_TYPES.SKILLS:
//           return <MobileSkillsComponent />;
//         case WINDOW_TYPES.CONTACT:
//           return <MobileContactComponent />;
//         default:
//           return (
//             <div className={styles.placeholderContent}>
//               <p>Content type '{content.type}' is not supported on mobile yet.</p>
//             </div>
//           );
//       }
//     }
    
//     return (
//       <div className={styles.placeholderContent}>
//         <p>No content available for this window.</p>
//       </div>
//     );
//   };

//   return (
//     <div className={styles.mobileWindow}>
//       <div className={styles.windowHeader}>
//         <div className={styles.windowTitle}>{window.title}</div>
//         <button
//           className={styles.closeButton}
//           onClick={handleClose}
//           aria-label="Close window"
//         >
//           ✕
//         </button>
//       </div>

//       <div className={styles.windowContent}>{renderContent()}</div>

//       <div className={styles.windowFooter}>
//         <button onClick={handleClose} className={styles.backButton}>
//           Back to Main Menu
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MobileWindow;
