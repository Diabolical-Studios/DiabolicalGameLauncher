import React from 'react';

const StatusBarAndContentPanel = ({ children, isMobile }) => {
  return (
    <div
      className={`w-full flex flex-col gap-3 h-full ${
        isMobile ? 'overflow-hidden' : 'overflow-y-auto'
      }`}
    >
      {children}
    </div>
  );
};

export default StatusBarAndContentPanel;
