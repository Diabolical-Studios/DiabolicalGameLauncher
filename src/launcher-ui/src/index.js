// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './tailwind.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ImageButton from "./components/button/ImageButton";
import DownloadIcon from '@mui/icons-material/Download';
import {Title} from "@mui/icons-material";
import {colors} from "./theme/colors";
import BackgroundAnimation from "./components/BackgroundAnimation";

// Mount your main app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);

// Conditionally mount the separate button if window.api is not defined
if (!window.api) {
    const buttonRoot = ReactDOM.createRoot(document.getElementById('button-root'));
    buttonRoot.render(<ImageButton
        text={"Download Launcher"}
        icon={DownloadIcon}
        onClick={() => window.open("https://github.com/Diabolical-Studios/DiabolicalGameLauncher/releases/latest", "_blank")}
        style={{
            position: 'absolute', top: "12px", right: "12px", padding: "12px", cursor: "pointer", width: "fit-content", filter: "invert(1)"
        }}
        className="game-button"
    />);

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
