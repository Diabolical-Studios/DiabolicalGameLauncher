const colors = {
    primary: "#07d400",        // Cyan
    secondary: "#ff4081",      // Pink
    background: "#000000",     // Dark Theme Background
    button: "#121212",
    border: "#444444",         // Gray Border
    text: "#ededed",           // White Text
    error: "#ff5252",          // Red for Errors
    success: "#00e676",        // Green for Success
    warning: "#ff9800",        // Orange for Warnings
    buttonHover: "#1f1f1f",    // Darker Gray
    transparent: "transparent",
};

/**
 * Injects colors into the CSS root as variables.
 */
const applyColorsToCSS = () => {
    const root = document.documentElement;
    Object.keys(colors).forEach((key) => {
        root.style.setProperty(`--${key}`, colors[key]);
        console.log(`✅ Set --${key} to ${colors[key]}`);
    });
};

// Automatically apply colors when the script runs
applyColorsToCSS();

export { colors, applyColorsToCSS };
