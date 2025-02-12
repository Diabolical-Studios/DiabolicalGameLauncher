import React, { useState, useEffect } from "react";
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
import LandingPage from "./pages/LandingPage";
import { applyColorsToCSS } from "./theme/colors";
import "./settings.css";
import "./changelog.css";

function App() {
    const [selectedPage, setSelectedPage] = useState("account");

    // ✅ Call applyColorsToCSS() once when App mounts
    useEffect(() => {
        applyColorsToCSS();
    }, []);

    const handlePageChange = (page) => {
        setSelectedPage(page);
    };

    return (
        <>
            <BackgroundAnimation />
            <AppLayout>
                <NavBar onPageChange={handlePageChange} />
                <StatusBarAndContentPanel>
                    <HorizontalFlex>
                        <StatusBar />
                        <AppCloseRefreshButtons />
                    </HorizontalFlex>

                    <ContentPanel>
                        {selectedPage === "home" && <LandingPage />}
                        {selectedPage === "settings" && <SettingsPage />}
                        {selectedPage === "changelog" && <ChangelogPage />}
                        {selectedPage === "account" && <AccountPage />}
                    </ContentPanel>
                </StatusBarAndContentPanel>
            </AppLayout>
            <Toaster />
        </>
    );
}

export default App;
