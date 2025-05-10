// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './tailwind.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ImageButton from './components/button/ImageButton';
import DownloadIcon from '@mui/icons-material/Download';
import { colors } from './theme/colors';
import { Stack } from '@mui/material';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

if (!window.api) {
  const buttonRoot = ReactDOM.createRoot(document.getElementById('button-root'));
  buttonRoot.render(
    <Stack
      style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        top: '12px',
        right: '12px',
        padding: '12px',
        width: 'fit-content',
        height: '70px',
        filter: 'invert(1)',
      }}
    >
      <button
        className="game-button shimmer-button flex flex-row justify-between items-center gap-3 w-fit"
        style={{ height: '100%', width: 'fit-content' }}
        onClick={() => window.open('https://discord.gg/RCKZSuGXa2', '_blank')}
      >
        <img alt="Discord" className={'w-6'} src="/discord.png" />
      </button>

      <ImageButton
        text={'Download Launcher'}
        icon={DownloadIcon}
        onClick={() =>
          window.open(
            'https://github.com/Diabolical-Studios/DiabolicalGameLauncher/releases/latest',
            '_blank'
          )
        }
        style={{
          padding: '12px',
          cursor: 'pointer',
          width: 'fit-content',
          height: '100%',
        }}
        className="game-button"
      />
    </Stack>
  );

  const titleRoot = ReactDOM.createRoot(document.getElementById('title-root'));
  titleRoot.render(
    <div
      style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        fontSize: '18px',
        color: colors.text,
      }}
    >
      Diabolical Launcher <br />
      by{' '}
      <a
        href="https://github.com/blazittx"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: colors.text, textDecoration: 'underline' }}
      >
        blazitt
      </a>
    </div>
  );
}

// Add this to the renderer process (e.g., in a preload script or at the top of your main React entry point)
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('state') === 'electron') {
        // Build the custom protocol URL with all query params
        const protoParams = [];
        for (const [key, value] of params.entries()) {
          if (key !== 'state') {
            protoParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
          }
        }
        const protoUrl = `diabolicallauncher://auth${protoParams.length ? '?' + protoParams.join('&') : ''}`;
        window.location.href = protoUrl;
        /* setTimeout(() => {
                  window.location.href = "https://launcher.diabolical.studio";
                }, 500); */
      }
    } catch (e) {
      // Fail silently
    }
  });
}

reportWebVitals();
