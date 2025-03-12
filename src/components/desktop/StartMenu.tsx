// components/desktop/StartMenu.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktop } from '../../context/DesktopContext';
import styles from '../styles/StartMenu.module.scss';
import Image from 'next/image'
import { useSounds } from '@/hooks/useSounds';




const StartMenu: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const { playSound } = useSounds();
  
  const handleMenuItemClick = (action: string) => {
    playSound('click');
    
    switch (action) {
      case 'about':
        dispatch({
          type: 'OPEN_WINDOW',
          payload: {
            id: 'about',
            title: 'About Me',
            content: 'about',
            minimized: false,
            position: { x: 100, y: 100 },
          }
        });
        break;
      case 'contact':
        dispatch({
          type: 'OPEN_WINDOW',
          payload: {
            id: 'contact',
            title: 'Contact Me',
            content: 'contact',
            minimized: false,
            position: { x: 150, y: 150 },
          }
        });
        break;
      default:
        break;
    }

    // Close menu after selection
    dispatch({ type: 'TOGGLE_START_MENU' });
  };

  return (
    <AnimatePresence>
      {state.startMenuOpen && (
        <motion.div
          className={styles.startMenu}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.menuHeader}>
            <div className={styles.menuTitle}>My Portfolio</div>
          </div>
          <div className={styles.menuItems}>
            <div
              className={styles.menuItem}
              onClick={() => handleMenuItemClick('about')}
            >
              <Image src="/icons/about.png" alt="About" />
              <span>About Me</span>
            </div>
            <div
              className={styles.menuItem}
              onClick={() => handleMenuItemClick('projects')}
            >
              <Image src="/icons/folder.png" alt="Projects" />
              <span>My Projects</span>
            </div>
            <div
              className={styles.menuItem}
              onClick={() => handleMenuItemClick('contact')}
            >
              <Image src="/icons/mail.png" alt="Contact" />
              <span>Contact Me</span>
            </div>
            <div className={styles.divider} />
            <div
              className={styles.menuItem}
              onClick={() => handleMenuItemClick('resume')}
            >
              <Image src="/icons/document.png" alt="Resume" />
              <span>Resume</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartMenu;
//         break;
//       case 'projects':
//         // Open a projects folder or list
//         break;
//       case 'cv':
//         // Open resume in a new window
//         window.open('/cv.pdf', '_blank');
//         break;
//       default:
//         break;
//     }
    
//     // Close menu after selection
//     dispatch({ type: 'TOGGLE_START_MENU' });
//   };
  
//   return (
//     <AnimatePresence>
//       {state.startMenuOpen && (
//         <motion.div
//           className={styles.startMenu}
//           initial={{ height: 0, opacity: 0 }}
//           animate={{ height: 'auto', opacity: 1 }}
//           exit={{ height: 0, opacity: 0 }}
//           transition={{ duration: 0.2 }}
//         >
//           <div className={styles.menuHeader}>
//             <div className={styles.menuTitle}>My Portfolio</div>
//           </div>
//           <div className={styles.menuItems}>
//             <div 
//               className={styles.menuItem}
//               onClick={() => handleMenuItemClick('about')}
//             >
//               <Image width={24} height={24}  src="/icons/win95/win98/w98_address_book_pad_users.ico" alt="About" />
//               <span>About Me</span>
//             </div>
//             <div 
//               className={styles.menuItem}
//               onClick={() => handleMenuItemClick('projects')}
//             >
//               <Image width={24} height={24} src="/icons/win95/w95_program_folder.ico" alt="Projects" />
//               <span>My Projects</span>
//             </div>
//             <div 
//               className={styles.menuItem}
//               onClick={() => handleMenuItemClick('contact')}
//             >
//               <Image width={24} height={24}  src="/icons/win95/w98_msn3.ico" alt="Contact" />
//               <span>Contact Me</span>
//             </div>
//             <div className={styles.divider} />
//             <div 
//               className={styles.menuItem}
//               onClick={() => handleMenuItemClick('cv')}
//             >
//               <Image width={24} height={24} src={"/icons/win95/w98_file_eye.ico"} alt="cv"   />
//               <span>CV</span>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default StartMenu;