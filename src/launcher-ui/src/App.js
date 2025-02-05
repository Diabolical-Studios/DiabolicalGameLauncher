import React, { useState } from "react";
import BackgroundAnimation from "./components/BackgroundAnimation";
import AppCloseRefreshButtons from "./components/AppCloseRefreshButtons";
import ActionBar from "./components/ActionBar";
import ContentPanel from "./components/ContentPanel";
import StatusBar from "./components/StatusBar";
import GameList from "./components/GameList";
import Toaster from "./components/Toaster";
import SettingsPage from "./pages/SettingsPage";
import ChangelogPage from "./pages/ChangelogPage";
import AccountPage from "./pages/AccountPage";
import "./settings.css";
import "./changelog.css";

function App() {
    const [selectedPage, setSelectedPage] = useState("home");

    const handlePageChange = (page) => {
        setSelectedPage(page);
    };

    return (
        <>
            <BackgroundAnimation />
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "-webkit-fill-available",
                    height: "-webkit-fill-available",
                    padding: "12px",
                    gap: "12px",
                }}
            >
                <ActionBar onPageChange={handlePageChange} />
                <div
                    style={{
                        width: "-webkit-fill-available",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <StatusBar />
                        <AppCloseRefreshButtons />
                    </div>
                    <div
                        style={{
                            height: "-webkit-fill-available",
                            display: "flex",
                            flexDirection: "row",
                            gap: "12px",
                            overflow: "hidden",
                        }}
                    >
                        <ContentPanel>
                            {selectedPage === "home" && <GameList />}
                            {selectedPage === "settings" && <SettingsPage />}
                            {selectedPage === "changelog" && <ChangelogPage />}
                            {selectedPage === "account" && <AccountPage />}
                        </ContentPanel>
                    </div>
                </div>
            </div>
            <Toaster />
        </>
    );
}

export default App;
