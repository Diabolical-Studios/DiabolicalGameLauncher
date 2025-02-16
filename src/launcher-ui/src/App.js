// App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BackgroundAnimation from "./components/BackgroundAnimation";
import AppCloseRefreshButtons from "./components/AppCloseRefreshButtons";
import NavBar from "./components/NavBar";
import ContentPanel from "./components/ContentPanel";
import StatusBar from "./components/StatusBar";
import Toaster from "./components/Toaster";
import SettingsPage from "./pages/SettingsPage";
import ChangelogPage from "./pages/ChangelogPage";
import AccountPage from "./pages/AccountPage";
import LandingPage from "./pages/LandingPage";
import AppLayout from "./components/AppLayout";
import StatusBarAndContentPanel from "./components/StatusBarAndContentPanel";
import HorizontalFlex from "./components/layout/HorizontalFlex";
import { applyColorsToCSS } from "./theme/colors";
import { applyFontsToCSS, themeFont } from "./theme/fonts";
import { ThemeProvider } from "@mui/material";

function App() {
    useEffect(() => {
        applyColorsToCSS();
        applyFontsToCSS();
    }, []);

    return (
        <ThemeProvider theme={themeFont}>
            <Router>
                <AppLayout>
                    <BackgroundAnimation />
                    {/* NavBar with React Router Links */}
                    <NavBar />

                    <StatusBarAndContentPanel>
                        <HorizontalFlex>
                            <StatusBar />
                            <AppCloseRefreshButtons />
                        </HorizontalFlex>

                        <ContentPanel>
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/account/*" element={<AccountPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="/changelog" element={<ChangelogPage />} />
                                {/* Add more routes if needed */}
                            </Routes>
                        </ContentPanel>
                    </StatusBarAndContentPanel>
                </AppLayout>
                <Toaster />
            </Router>
        </ThemeProvider>
    );
}

export default App;
