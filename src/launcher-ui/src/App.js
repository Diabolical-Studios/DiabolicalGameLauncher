import React from "react";
import Background from "./components/Background";
import TitleBar from "./components/TitleBar";
import ActionBar from "./components/ActionBar";

function App() {
    return (
        <>
            <Background />
            <TitleBar />
            <ActionBar />
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    textAlign: "center",
                    color: "white",
                }}
            >
                <h1>Launcher UI</h1>
            </div>
        </>
    );
}

export default App;
