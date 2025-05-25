import React, { useEffect, useState } from 'react';
import { colors } from '../theme/colors';

const AppLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const showBorder = typeof window !== 'undefined' && !window.api;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={`overflow-hidden flex ${isMobile ? 'flex-col' : 'flex-row'} w-full h-full p-3 gap-3 rounded-sm ${showBorder ? 'border' : ''}`}
      style={{
        maxHeight: isMobile ? 'none' : '720px',
        maxWidth: isMobile ? 'none' : '1280px',
        width: isMobile ? '100svw' : undefined,
        height: isMobile ? '100svh' : undefined,
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
