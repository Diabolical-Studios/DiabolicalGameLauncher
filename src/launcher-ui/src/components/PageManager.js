import React, { Suspense, useEffect, useState } from 'react';
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Fade } from '@mui/material';
import { colors } from '../theme/colors';

// Lazy load all pages
const StorePage = React.lazy(() => import('../pages/StorePage'));
const LibraryPage = React.lazy(() => import('../pages/LibraryPage'));
const AccountPage = React.lazy(() => import('../pages/AccountPage'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));
const ChangelogPage = React.lazy(() => import('../pages/ChangelogPage'));

// Main navigation paths that should have fade animation
const MAIN_PATHS = ['/', '/library', '/account', '/settings', '/changelog'];

const PageManager = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  // Check if the current path is a main navigation path
  const isMainPath = path => {
    return MAIN_PATHS.some(mainPath => path === mainPath || path.startsWith(mainPath + '/'));
  };

  // Get the main path for a given route
  const getMainPath = path => {
    return (
      MAIN_PATHS.find(mainPath => path === mainPath || path.startsWith(mainPath + '/')) || path
    );
  };

  // Handle page transitions
  useEffect(() => {
    if (location.pathname !== currentPath) {
      const currentMainPath = getMainPath(currentPath);
      const newMainPath = getMainPath(location.pathname);

      // Only apply transition if we're changing main paths
      if (currentMainPath !== newMainPath) {
        setIsTransitioning(true);

        // Wait for fade out to complete before changing pages
        const timer = setTimeout(() => {
          setCurrentPath(location.pathname);
          // Start fade in
          setIsTransitioning(false);
        }, 300);

        return () => clearTimeout(timer);
      } else {
        // For inner page changes, update immediately without animation
        setCurrentPath(location.pathname);
      }
    }
  }, [location.pathname, currentPath]);

  const shouldAnimate = isMainPath(currentPath) && isMainPath(location.pathname);

  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <CircularProgress sx={{ color: colors.primary }} />
        </div>
      }
    >
      {shouldAnimate ? (
        <Fade in={!isTransitioning} timeout={300}>
          <div style={{ height: '100%', width: '100%' }}>
            <Routes location={currentPath}>
              <Route path="/" element={<StorePage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/account" element={<AccountPage />}>
                <Route index element={<Navigate to="/account/dashboard" replace />} />
                <Route path="*" element={<AccountPage />} />
              </Route>
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
            </Routes>
          </div>
        </Fade>
      ) : (
        <div style={{ height: '100%', width: '100%' }}>
          <Routes location={currentPath}>
            <Route path="/" element={<StorePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/account" element={<AccountPage />}>
              <Route index element={<Navigate to="/account/dashboard" replace />} />
              <Route path="*" element={<AccountPage />} />
            </Route>
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
          </Routes>
        </div>
      )}
    </Suspense>
  );
};

export default PageManager;
