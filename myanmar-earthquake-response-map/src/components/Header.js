// src/components/Header.js
import React, { useState, useEffect } from 'react';
import './Header.css';
import About from './About';
import EmergencyContacts from './EmergencyContacts';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);

  // Close menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [menuOpen]);

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (menuOpen || showAbout || showEmergencyContacts) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [menuOpen, showAbout, showEmergencyContacts]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const openAbout = (e) => {
    e.preventDefault();
    setShowAbout(true);
    closeMenu();
  };

  const openEmergencyContacts = (e) => {
    e.preventDefault();
    setShowEmergencyContacts(true);
    closeMenu();
  };

  return (
    <header className="header">
      <div className="logo">
        <h1>Myanmar Earthquake Map</h1>
      </div>
      
      <div 
        className={`hamburger-menu ${menuOpen ? 'active' : ''}`} 
        onClick={toggleMenu}
        aria-label="Toggle menu"
        role="button"
        tabIndex={0}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <nav className={menuOpen ? 'open' : ''}>
        <ul>
          <li><a href="#" onClick={openAbout}>About</a></li>
          <li><a href="#" onClick={openEmergencyContacts}>Emergency Contacts</a></li>
          <li><a href="#" onClick={closeMenu}>Help</a></li>
        </ul>
      </nav>
      
      {/* Backdrop for closing the menu when clicking outside */}
      <div 
        className={`backdrop ${menuOpen ? 'show' : ''}`} 
        onClick={closeMenu}
      ></div>

      {/* About modal */}
      {showAbout && <About onClose={() => setShowAbout(false)} />}
      
      {/* Emergency Contacts modal */}
      {showEmergencyContacts && <EmergencyContacts onClose={() => setShowEmergencyContacts(false)} />}
    </header>
  );
}

export default Header;