import React from 'react';

const VerticalFlex = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        left: 0,
        top: 0,
        height: '100%',
        width: 'min-content',
        zIndex: 9998,
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
};

export default VerticalFlex;
