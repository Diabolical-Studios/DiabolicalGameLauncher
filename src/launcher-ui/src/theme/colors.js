const darkTheme = {
    background: "#000000",
    text: "#ffffff",
    border: "#444444",
    button: "#333333",
    primary: "#07d400",
    secondary: "#ff4081",
    error: "#ff5252",
    success: "#07d400",
    warning: "#ff9800",
    buttonHover: "#1f1f1f",
    transparent: "transparent",
};

const lightTheme = {
    background: "#ffffff",
    text: "#000000",
    border: "#cccccc",
    button: "#f5f5f5",
    primary: "#07d400",
    secondary: "#ff4081",
    error: "#ff5252",
    success: "#07d400",
    warning: "#ff9800",
    buttonHover: "#e0e0e0",
    transparent: "transparent",
};

export const colors = darkTheme;

export const applyColorsToCSS = (theme = "dark") => {
    const themeColors = theme === "dark" ? darkTheme : lightTheme;
    Object.assign(colors, themeColors);

    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
    });
};

// Automatically apply colors when the script runs
applyColorsToCSS();
