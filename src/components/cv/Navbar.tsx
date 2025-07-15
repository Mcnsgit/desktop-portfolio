import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Import your styles
import localStyles from '../styles/Navbar.module.scss';
import { styles as globalStyles } from "../cv/styles";
import { navLinks } from '../../config/index';
import  logo from '../../../public/assets/logos/tech-logos/logo.png';

// You'll need to import these or create equivalents
// import { logo, menuIcon, closeIcon } from '../assets';
// import { navLinks } from '../constants';

const Navbar = () => {
  const [active, setActive] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [toggle, setToggle] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 50);

      // Offset to account for fixed navbar height or desired trigger point
      const scrollOffset = 150; // Adjust as needed

      let currentSectionId = "";
      navLinks.forEach((link) => {
        const section = document.getElementById(link.id);
        if (section) {
          const sectionTop = section.offsetTop;
          if (scrollY >= sectionTop - scrollOffset) {
            currentSectionId = link.id;
          }
        }
      });

      // If scrolled to the very top, and "main" (or equivalent for Hero) is a navLink, set it active.
      // Otherwise, if no section is matched (e.g., scrolled past the last one), clear active or set to last.
      setActive(currentSectionId);
    };


    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80, // Keep existing offset for click scroll
        behavior: 'smooth',
      });
      setActive(sectionId); // Set active immediately on click
      setToggle(false); // Close mobile menu if open
    }
  };

  return (
    <nav
      className={`${localStyles.navbar} ${scrolled ? localStyles.scrolled : ''} ${globalStyles.paddingX}`}
    >
      <div className={localStyles.navContent}>
        <Link href='/'
          className={localStyles.logoContainer}
          onClick={(e) => scrollToSection(e, "main")}
          >
          <Image 
            src={logo} 
            alt='Miguel Cardiga' 
            className={localStyles.logo} 
            width={44}
            height={44}
          />
          <span className={localStyles.logoText}>Miguel Cardiga</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className={localStyles.desktopNav}>
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className={`${localStyles.navLink} ${active === link.id ? localStyles.navLinkActive : ''}`}
                onClick={(e) => {
                  scrollToSection(e, link.id);
                }}
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Navigation */}
        <div className={localStyles.mobileMenuContainer}>
          <button 
            className={localStyles.menuButton}
            onClick={() => setToggle(!toggle)}
            aria-label={toggle ? 'Close menu' : 'Open menu'}
          >
            <svg 
              className={localStyles.menuIcon}
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {toggle ? (
                <path 
                  d="M18 6L6 18M6 6L18 18" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              ) : (
                <path 
                  d="M4 6H20M4 12H20M4 18H20" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </button>

          {/* Mobile Menu Dropdown */}
          {toggle && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={localStyles.mobileMenu}
            >
              <ul className={localStyles.mobileNav}>
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      className={`${localStyles.navLink} ${active === link.id ? localStyles.navLinkActive : ''}`}
                      onClick={(e) => {
                        scrollToSection(e, link.id);
                      }}
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;