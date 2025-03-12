// components/desktop/StartMenu.tsx
import React, { useEffect } from 'react';
import { useDesktop } from '../../context/DesktopContext';
import styles from '../styles/StartMenu.module.scss';
import { useSounds } from '../../hooks/useSounds';

const StartMenu: React.FC = () => {
  const { state, dispatch } = useDesktop();
  const { playSound } = useSounds();

  // Debug effect to monitor start menu state
  useEffect(() => {
    console.log("StartMenu rendered with open state:", state.startMenuOpen);
  }, [state.startMenuOpen]);

  const handleMenuItemClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault(); // Prevent default behavior

    console.log(`Start menu item clicked: ${action}`); // Debug log
    playSound('click');

    // Handle different menu items
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
            size: { width: 500, height: 400 },
          }
        });
        break;

      case 'projects':
        dispatch({
          type: 'OPEN_WINDOW',
          payload: {
            id: 'projects-folder',
            title: 'My Projects',
            content: 'projects-folder',
            minimized: false,
            position: { x: 120, y: 120 },
            size: { width: 600, height: 400 },
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
            size: { width: 450, height: 350 },
          }
        });
        break;

      case 'resume':
        dispatch({
          type: 'OPEN_WINDOW',
          payload: {
            id: 'resume',
            title: 'My Resume',
            content: 'resume',
            minimized: false,
            position: { x: 180, y: 120 },
            size: { width: 650, height: 500 },
          }
        });
        break;

      default:
        break;
    }

    // Close menu after selection
    setTimeout(() => {
      dispatch({ type: 'TOGGLE_START_MENU' });
    }, 100);
  };

  if (!state.startMenuOpen) {
    console.log("StartMenu is closed, not rendering");
    return null;
  }

  console.log("StartMenu is open, rendering menu");

  // Define the menu styles with extremely high z-index
  const menuStyle = {
    position: 'fixed' as 'fixed', // Use fixed instead of absolute to break out of any stacking contexts
    bottom: '40px',
    left: '0',
    width: '200px',
    backgroundColor: '#c0c0c0',
    border: '2px solid',
    borderColor: '#ffffff #808080 #808080 #ffffff',
    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)',
    zIndex: 9999, // Very high z-index to ensure it's on top
  };

  const headerStyle = {
    padding: '5px 10px',
    backgroundColor: '#000080',
    color: 'white',
    fontWeight: 'bold',
  };

  const itemsStyle = {
    padding: '5px 0',
  };

  const itemStyle = {
    padding: '5px 10px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  };

  const dividerStyle = {
    height: '1px',
    backgroundColor: '#808080',
    margin: '5px 0',
  };

  // Create a simple colored icon
  const IconBox: React.FC<{ letter: string; color?: string }> = ({ letter, color = '#1e90ff' }) => (
    <div style={{
      width: '24px',
      height: '24px',
      backgroundColor: color,
      marginRight: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      color: 'white',
      fontSize: '14px',
      fontWeight: 'bold'
    }}>
      {letter}
    </div>
  );

  return (
    <div
      style={menuStyle}
      onClick={(e) => {
        e.stopPropagation();
        console.log("Click inside start menu (propagation stopped)");
      }}
    >
      <div style={headerStyle}>
        <div>My Portfolio</div>
      </div>
      <div style={itemsStyle}>
        <div
          style={itemStyle}
          onClick={(e) => handleMenuItemClick(e, 'about')}
        >
          <IconBox letter="A" />
          <span>About Me</span>
        </div>
        <div
          style={itemStyle}
          onClick={(e) => handleMenuItemClick(e, 'projects')}
        >
          <IconBox letter="P" />
          <span>My Projects</span>
        </div>
        <div
          style={itemStyle}
          onClick={(e) => handleMenuItemClick(e, 'contact')}
        >
          <IconBox letter="C" />
          <span>Contact Me</span>
        </div>
        <div style={dividerStyle} />
        <div
          style={itemStyle}
          onClick={(e) => handleMenuItemClick(e, 'resume')}
        >
          <IconBox letter="R" />
          <span>Resume</span>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;