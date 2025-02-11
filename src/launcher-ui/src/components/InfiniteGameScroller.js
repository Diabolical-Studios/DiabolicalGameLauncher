import React from "react";
import {Stack} from "@mui/material";

const DURATION = 15000;
const ROWS = 3;
const GAMES_PER_ROW = 4;

const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

const InfiniteLoopSlider = ({children, duration, reverse = false}) => {
    return (
        <div className="loop-slider"
             style={{"--duration": `${duration}ms`, "--direction": reverse ? "reverse" : "normal"}}>
            <div className="inner">
                {children}
                {children}
                {children}
                {children}
            </div>
        </div>
    );
};

const GameTag = ({name}) => (
    <div className="game-button shimmer-button" style={{width: "fit-content",}}>{name}</div>
);

const InfiniteGameScroller = ({games}) => {
    if (!games || games.length === 0) return <p>No games found.</p>;

    return (
        <Stack direction="column" alignItems="center" spacing={2}>
            <div className="game-list">
                {[...new Array(ROWS)].map((_, i) => (
                    <InfiniteLoopSlider key={i} duration={DURATION + i * 3000} reverse={i % 2}>
                        {shuffle(games).slice(0, GAMES_PER_ROW).map((game, index) => (
                            <GameTag name={game.game_name} key={index}/>
                        ))}
                    </InfiniteLoopSlider>
                ))}
                <div className="fade"/>
            </div>
        </Stack>
    );
};

export default InfiniteGameScroller;
