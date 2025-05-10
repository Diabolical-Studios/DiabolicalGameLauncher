import React, { useState } from 'react';

const HoverMenu = ({ actions }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        zIndex: 5,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hamburger Button */}
      <button
        className="game-button shimmer-button"
        style={{
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <img src={'MenuIcons/Hamburger.png'} alt="Menu" />
      </button>

      {/* Action Buttons - Appear Above */}
      <div
        style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: `translateX(-50%) ${isHovered ? 'translateY(-10px)' : 'translateY(0px)'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? 'auto' : 'none',
          transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
        }}
      >
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              padding: '8px',
            }}
            className="game-button shimmer-button"
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.0)')}
          >
            <img src={action.icon} alt={action.label} style={{ width: '100%' }} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HoverMenu;
