const darkTheme = {
  background: '#000000',
  text: '#ffffff',
  border: '#444444',
  button: '#333333',
  primary: '#52dc4b',
  secondary: '#ff4081',
  error: '#ff5252',
  success: '#07d400',
  warning: '#ff9800',
  buttonHover: '#1f1f1f',
  primaryHover: '#168110',
  transparent: 'transparent',
  update: '#ff9800',
};

export const colors = darkTheme;

export const applyColorsToCSS = () => {
  Object.assign(colors, darkTheme);

  const root = document.documentElement;
  Object.entries(darkTheme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
};

// Automatically apply colors when the script runs
applyColorsToCSS();
