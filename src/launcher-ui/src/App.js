// App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BackgroundAnimation from "./components/BackgroundAnimation";
import AppCloseRefreshButtons from "./components/AppCloseRefreshButtons";
import NavBar from "./components/NavBar";
import ContentPanel from "./components/ContentPanel";
import StatusBar from "./components/StatusBar";
import Toaster from "./components/Toaster";
import SettingsPage from "./pages/SettingsPage";
import ChangelogPage from "./pages/ChangelogPage";
import AccountPage from "./pages/AccountPage";
import AppLayout from "./components/AppLayout";
import StatusBarAndContentPanel from "./components/StatusBarAndContentPanel";
import HorizontalFlex from "./components/layout/HorizontalFlex";
import { applyColorsToCSS } from "./theme/colors";
import { ThemeProvider, createTheme } from "@mui/material";
import LibraryPage from "./pages/LibraryPage";
import StorePage from "./pages/StorePage";

const App = () => {
  const [muiTheme, setMuiTheme] = useState(
    createTheme({
      palette: {
        mode: "dark",
        primary: {
          main: "#07d400",
        },
        secondary: {
          main: "#ff4081",
        },
        background: {
          default: "#000000",
          paper: "#000000",
        },
        text: {
          primary: "#ffffff",
          secondary: "#cccccc",
        },
        divider: "#444444",
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              backgroundColor: "#333333",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#1f1f1f",
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#000000",
                color: "#ffffff",
                "& fieldset": {
                  borderColor: "#444444",
                },
              },
            },
          },
        },
      },
    })
  );

  useEffect(() => {
    // Load initial theme from settings
    if (window.electronAPI) {
      window.electronAPI.getSettings().then((settings) => {
        applyColorsToCSS(settings.theme);
        updateMuiTheme(settings.theme);
      });

      // Listen for theme changes
      window.electronAPI.onThemeChanged((newTheme) => {
        applyColorsToCSS(newTheme);
        updateMuiTheme(newTheme);
      });
    }
  }, []);

  const updateMuiTheme = (newTheme) => {
    setMuiTheme(
      createTheme({
        palette: {
          mode: newTheme,
          primary: {
            main: "#07d400",
          },
          secondary: {
            main: "#ff4081",
          },
          background: {
            default: newTheme === "dark" ? "#000000" : "#ffffff",
            paper: newTheme === "dark" ? "#000000" : "#ffffff",
          },
          text: {
            primary: newTheme === "dark" ? "#ffffff" : "#000000",
            secondary: newTheme === "dark" ? "#cccccc" : "#666666",
          },
          divider: newTheme === "dark" ? "#444444" : "#cccccc",
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                backgroundColor: newTheme === "dark" ? "#333333" : "#f5f5f5",
                color: newTheme === "dark" ? "#ffffff" : "#000000",
                "&:hover": {
                  backgroundColor: newTheme === "dark" ? "#1f1f1f" : "#e0e0e0",
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  backgroundColor: newTheme === "dark" ? "#000000" : "#ffffff",
                  color: newTheme === "dark" ? "#ffffff" : "#000000",
                  "& fieldset": {
                    borderColor: newTheme === "dark" ? "#444444" : "#cccccc",
                  },
                },
              },
            },
          },
        },
      })
    );
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Router>
        <AppLayout>
          <BackgroundAnimation />
          <NavBar />
          <StatusBarAndContentPanel>
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
              </Routes>
            </ContentPanel>
          </StatusBarAndContentPanel>
          <Toaster />
        </AppLayout>
      </Router>
    </ThemeProvider>
  );
};

export default App;
