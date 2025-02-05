import React from "react";

const ContentPanel = () => {
    return (
        <div style={{
            display: "flex",
            flexGrow: "1",
            flexDirection: "column",
            gap: "12px",
            overflow: "hidden"
        }}>
            {/* Launcher Info */}
            {/*<div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                padding: "10px",
                border: "1px solid #242424",
                borderRadius: "8px",
                backgroundColor: "rgba(5, 5, 5, 0.416)",
                backdropFilter: "blur(2px)",
            }}>
                <div id="message">Status message...</div>
                <div id="launcher-version-status-and-number" style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "12px",
                }}>
                    <span id="launcher-version-number"></span>
                    <div id="launcher-version-status" style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "12px",
                        backgroundColor: "rgb(97, 97, 97)",
                        animation: "blink 2s infinite",
                        boxShadow: "0 0 12px rgb(128, 128, 128)",
                    }}></div>
                </div>
            </div>*/}

            {/* Content Area */}
            <div className="ContentArea" id="contentArea" style={{
                flexGrow: "1",
                position: "relative",
                height: "100%",
                padding: "12px",
                border: "1px solid #242424",
                borderRadius: "2px",
                backgroundColor: "rgba(5, 5, 5, 0.416)",
                overflow: "hidden",
                backdropFilter: "blur(2px)",
            }}>
                <div id="game-cards-container">
                    <div className="game-banner">
                        <div className="card loading">
                            <div className="image"></div>
                            <div className="content">
                                <h1></h1>
                                <h2></h2>
                            </div>
                        </div>
                    </div>

                    <div className="game-banner">
                        <div className="card loading">
                            <div className="image"></div>
                            <div className="content">
                                <h1></h1>
                                <h2></h2>
                            </div>
                        </div>
                    </div>

                    <div className="game-banner">
                        <div className="card loading">
                            <div className="image"></div>
                            <div className="content">
                                <h1></h1>
                                <h2></h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentPanel;
