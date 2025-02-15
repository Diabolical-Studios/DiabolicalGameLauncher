import {createTheme} from "@mui/material/styles";

const fonts = {
    primary: "'JetBrains Mono', monospace",
    secondary: "'Fira Code', monospace",
    fallback: "monospace",
};

/**
 * Injects fonts into the CSS root as variables.
 */
const applyFontsToCSS = () => {
    const root = document.documentElement;
    Object.keys(fonts).forEach((key) => {
        root.style.setProperty(`--font-${key}`, fonts[key]);
    });
};

// Automatically apply fonts on load
applyFontsToCSS();

/**
 * MUI Theme for Global Typography
 */
const themeFont = createTheme({
    typography: {
        fontFamily: fonts.primary,
        h1: {fontFamily: fonts.primary},
        h2: {fontFamily: fonts.primary},
        body1: {fontFamily: fonts.primary},
        button: {fontFamily: fonts.primary},
    },
});

export {fonts, applyFontsToCSS, themeFont};
