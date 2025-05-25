import React from 'react';

const VerticalFlex = ({ children, style = {} }) => {
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
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default VerticalFlex;
