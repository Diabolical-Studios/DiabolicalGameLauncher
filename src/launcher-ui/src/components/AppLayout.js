import React from 'react';
import { colors } from '../theme/colors';

const AppLayout = ({ children }) => {
  const showBorder = typeof window !== 'undefined' && !window.api;
  return (
    <div
      className={`overflow-hidden flex flex-row w-full h-full p-3 gap-3 rounded-sm ${showBorder ? 'border' : ''}`}
      style={{
        maxHeight: '720px',
        maxWidth: '1280px',
        position: 'relative',
        overflowY: 'hidden',
        borderColor: colors.border,
      }}
    >
      {children}
    </div>
  );
};

export default AppLayout;
