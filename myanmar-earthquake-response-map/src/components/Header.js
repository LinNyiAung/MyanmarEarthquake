import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <h1>Myanmar Earthquake Response Map</h1>
      </div>
      <nav>
        <ul>
          <li><a href="#">About</a></li>
          <li><a href="#">Emergency Contacts</a></li>
          <li><a href="#">Help</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;