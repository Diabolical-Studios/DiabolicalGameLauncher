import React, { useState } from "react";
import Background from "./components/Background";
import AppCloseRefreshButtons from "./components/AppCloseRefreshButtons";
import ActionBar from "./components/ActionBar";
import ContentPanel from "./components/ContentPanel";
import StatusBar from "./components/StatusBar";
import GameList from "./components/GameList";
import Toaster from "./components/Toaster";
import SettingsPage from "./pages/SettingsPage"; // Import SettingsPage component
import ChangelogPage from "./pages/ChangelogPage"; // Import ChangelogPage component
import "./settings.css"; // Import the styles properly
import "./changelog.css"; // Import the styles properly


function App() {
    const [selectedPage, setSelectedPage] = useState("home");

    // Function to change the selected page
    const handlePageChange = (page) => {
        setSelectedPage(page);
    };

    return (
        <>
            <Background />
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
                {/* Pass the page change function to ActionBar */}
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
                        {/* Render selected content */}
                        <ContentPanel>
                            {selectedPage === "home" && <GameList />}
                            {selectedPage === "settings" && <SettingsPage />}
                            {selectedPage === "changelog" && <ChangelogPage />}
                        </ContentPanel>
                    </div>
                </div>
            </div>
            <Toaster />
        </>
    );
}

export default App;
