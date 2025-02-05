import React from "react";

const GameCard = ({ game, isInstalled, onAction }) => {
    const buttonIcon = isInstalled
        ? "MenuIcons/play.png"
        : "MenuIcons/download.png";

    return (
        <div className="game-banner" style={{ backgroundImage: `url('${game.background_image_url}')` }}>
            <div className="game-details">
                <h3>{game.game_name}</h3>
                <p>{game.description}</p>
            </div>
            <button className="game-button shimmer-button" onClick={() => onAction(game.game_id)}>
                <img src={buttonIcon} alt={isInstalled ? "Play" : "Download"} />
            </button>
        </div>
    );
};

export default GameCard;
