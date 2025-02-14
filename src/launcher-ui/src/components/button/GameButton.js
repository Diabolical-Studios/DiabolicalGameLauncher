import React from "react";

const GameButton = ({gameInstalled, downloadProgress, gameVersion, onClick}) => {
    return (
        <button
            className="game-button shimmer-button w-full flex justify-between align-center"
            onClick={onClick}
        >
            <img
                src={gameInstalled ? "MenuIcons/play.png" : "MenuIcons/download.png"}
                alt={gameInstalled ? "Play" : "Download"}
            />
            <p style={{margin: "0", fontSize: "14px"}}>
                {downloadProgress || gameVersion}
            </p>
        </button>
    );
};

export default GameButton;
