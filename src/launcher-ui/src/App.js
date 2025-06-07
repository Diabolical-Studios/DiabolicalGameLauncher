// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BackgroundAnimation from './components/BackgroundAnimation';
import AppCloseRefreshButtons from './components/AppCloseRefreshButtons';
import NavBar from './components/NavBar';
import ContentPanel from './components/ContentPanel';
import StatusBar from './components/StatusBar';
import Toaster from './components/Toaster';
import SettingsPage from './pages/SettingsPage';
import ChangelogPage from './pages/ChangelogPage';
import AccountPage from './pages/AccountPage';
import AppLayout from './components/AppLayout';
import StatusBarAndContentPanel from './components/StatusBarAndContentPanel';
import HorizontalFlex from './components/layout/HorizontalFlex';
import { applyColorsToCSS } from './theme/colors';
import { createTheme, CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import LibraryPage from './pages/LibraryPage';
import StorePage from './pages/StorePage';
import CustomCursor from './components/common/CustomCursor';
import TermsOfService from './components/account/TermsOfService';
import PrivacyPolicy from './components/account/PrivacyPolicy';

const App = () => {
  const [muiTheme] = useState(
    createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: '#07d400',
        },
        secondary: {
          main: '#ff4081',
        },
        background: {
          default: '#000000',
          paper: '#000000',
        },
        text: {
          primary: '#ffffff',
          secondary: '#cccccc',
        },
        divider: '#444444',
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              backgroundColor: '#333333',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#1f1f1f',
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#000000',
                color: '#ffffff',
                '& fieldset': {
                  borderColor: '#444444',
                },
              },
            },
          },
        },
      },
    })
  );

  const [settings, setSettings] = useState({
    windowSize: '1280x720',
    language: 'en',
    autoUpdate: true,
    notifications: true,
    minimizeToTray: false,
    launchOnStartup: false,
    downloadPath: '',
    maxConcurrentDownloads: 3,
    cacheSize: '5GB',
    customCursor: false,
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Load initial theme from settings
    if (window.electronAPI) {
      window.electronAPI.getSettings().then(savedSettings => {
        setSettings(savedSettings);
        applyColorsToCSS();
      });

      // Listen for settings updates
      window.electronAPI.onSettingsUpdated(updatedSettings => {
        setSettings(updatedSettings);
      });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply cursor setting changes immediately
  useEffect(() => {
    document.body.style.cursor = settings.customCursor ? 'none' : 'auto';
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, select, textarea'
    );
    interactiveElements.forEach(el => {
      el.style.cursor = settings.customCursor ? 'none' : 'auto';
    });
  }, [settings.customCursor]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '*': {
            cursor: settings.customCursor ? 'none !important' : 'auto',
          },
          'a, button, [role="button"], input, select, textarea': {
            cursor: settings.customCursor ? 'none !important' : 'auto',
          },
        }}
      />
      {settings.customCursor && <CustomCursor />}
      <Router>
        <AppLayout>
          <BackgroundAnimation />
          {!isMobile && <NavBar />}
          <StatusBarAndContentPanel isMobile={isMobile}>
            <HorizontalFlex>
              <StatusBar />
              <AppCloseRefreshButtons></AppCloseRefreshButtons>
            </HorizontalFlex>
            <ContentPanel>
              <Routes>
                <Route path="/" element={<StorePage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/account/*" element={<AccountPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/changelog" element={<ChangelogPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
              </Routes>
            </ContentPanel>
          </StatusBarAndContentPanel>
          {isMobile && <NavBar />}
          <Toaster />
        </AppLayout>
      </Router>
    </ThemeProvider>
  );
};

export default App;
