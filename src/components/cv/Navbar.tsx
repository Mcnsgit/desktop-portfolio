import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Import your styles
import styles from '../styles/Navbar.module.scss';
import { navLinks } from '../../data/index';
import { logo } from '../../../public/assets';

// You'll need to import these or create equivalents
// import { logo, menuIcon, closeIcon } from '../assets';
// import { navLinks } from '../constants';

const Navbar = () => {
  const [active, setActive] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [toggle, setToggle] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
    >
      <div className={styles.navContent}>
        <Link href='/'
          className={styles.logoContainer}
          onClick={() => {
            setActive("");
            window.scrollTo(0, 0);
          }}
        >
          <Image 
            src={logo} 
            alt='Miguel Cardiga' 
            className={styles.logo} 
            width={44}
            height={44}
          />
          <span className={styles.logoText}>Miguel Cardiga</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className={styles.desktopNav}>
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className={`${styles.navLink} ${active === link.title ? styles.navLinkActive : ''}`}
                onClick={() => setActive(link.title)}
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Navigation */}
        <div className={styles.mobileMenuContainer}>
          <button 
            className={styles.menuButton}
            onClick={() => setToggle(!toggle)}
            aria-label={toggle ? 'Close menu' : 'Open menu'}
          >
            <svg 
              className={styles.menuIcon}
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
              className={styles.mobileMenu}
            >
              <ul className={styles.mobileNav}>
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      className={`${styles.navLink} ${active === link.title ? styles.navLinkActive : ''}`}
                      onClick={() => {
                        setToggle(false);
                        setActive(link.title);
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