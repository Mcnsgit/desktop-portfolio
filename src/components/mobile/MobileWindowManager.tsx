// import React from "react";
// import MobileWindow from "./MobileWindow";
// import styles from "../styles/MobileWindowManager.module.scss";
// import { Desktop as DesktopModel } from "@/model/Desktop";
// import { WindowModel } from "@/model/Window";
//   import { WindowState } from "@/config/constants";

// interface MobileWindowManagerProps {
//   desktopModel: DesktopModel;
// }

// const MobileWindowManager: React.FC<MobileWindowManagerProps> = ({ desktopModel }) => {
//   // Filter for open windows
//   const openWindows = desktopModel.windowManager.getWindowsForUI().filter((window: WindowModel) => window.state !== WindowState.MINIMIZED);

//   if (openWindows.length === 0) return null;

//   // In mobile view, only show the most recently opened window
//   const topWindow = openWindows[openWindows.length - 1];

//   return (
//     <div className={styles.mobileWindowManager}>
//       <MobileWindow window={topWindow} desktopModel={desktopModel} />

//       {/* If there are multiple windows open, show a window switcher */}
//       {openWindows.length > 1 && (
//         <div className={styles.windowSwitcher}>
//           {openWindows.map((window, index) => (
//             <button
//               key={window.id}
//               className={`${styles.switcherButton} ${
//                 window.id === topWindow.id ? styles.active : ""
//               }`}
//               onClick={() => {
//                 // Move this window to the top of the stack
//                 desktopModel.windowManager.setFocus(window.id);
//               }}
//             >
//               {index + 1}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default MobileWindowManager;
