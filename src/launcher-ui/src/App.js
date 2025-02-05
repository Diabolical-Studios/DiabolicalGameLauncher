import React from "react";
import Background from "./components/Background";
import AppCloseRefreshButtons from "./components/AppCloseRefreshButtons";
import ActionBar from "./components/ActionBar";
import ContentPanel from "./components/ContentPanel";
import StatusBar from "./components/StatusBar";
import GameList from "./components/GameList"; // Import the GameList component

function App() {
    return (
        <>
            <Background/>
            <div style={{display: "flex", flexDirection: "row", width: "-webkit-fill-available", height: "-webkit-fill-available", padding: "12px", gap: "12px",}}>
                <ActionBar/>
                <div style={{width:'-webkit-fill-available', display: "flex", flexDirection: "column", gap: "12px",}}>
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}>
                        <StatusBar/>
                        <AppCloseRefreshButtons/>
                    </div>
                    <div style={{
                        height: "-webkit-fill-available",
                        display: "flex",
                        flexDirection: "row",
                        gap: "12px"
                    }}>
                        <ContentPanel>
                            <GameList /> {/* Add the GameList inside the content panel */}
                        </ContentPanel>
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
