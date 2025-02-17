// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './tailwind.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ImageButton from "./components/button/ImageButton";
import DownloadIcon from '@mui/icons-material/Download';
import {colors} from "./theme/colors";
import {Stack} from "@mui/material";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);

if (!window.api) {
    const buttonRoot = ReactDOM.createRoot(document.getElementById('button-root'));
    buttonRoot.render(<Stack style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'row',
        gap: "12px",
        top: "12px",
        right: "12px",
        padding: "12px",
        width: "fit-content",
        height: "70px",
        filter: "invert(1)"
    }}>
        <button className="game-button shimmer-button flex flex-row justify-between items-center gap-3 w-fit"
                style={{height: "100%", width: "fit-content"}}
                onClick={() => window.open("https://discord.gg/RCKZSuGXa2", "_blank")}>
            <img alt="Discord" className={"w-6"}
                 src="/discord.png"/>
        </button>

        <ImageButton
            text={"Download Launcher"}
            icon={DownloadIcon}
            onClick={() => window.open("https://github.com/Diabolical-Studios/DiabolicalGameLauncher/releases/latest", "_blank")}
            style={{
                padding: "12px", cursor: "pointer", width: "fit-content", height: "100%"
            }}
            className="game-button"
        />
    </Stack>);

    const titleRoot = ReactDOM.createRoot(document.getElementById('title-root'));
    titleRoot.render(<div
        style={{
            position: 'absolute', top: '12px', left: '12px', fontSize: '18px', color: colors.text,
        }}
    >
        Diabolical Launcher <br/>
        by{' '}
        <a
            href="https://github.com/blazittx"
            target="_blank"
            rel="noopener noreferrer"
            style={{color: colors.text, textDecoration: 'underline'}}
        >
            blazitt
        </a>
    </div>);

}

reportWebVitals();
