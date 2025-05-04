// App.js
import React, {useEffect, useState} from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import BackgroundAnimation from "./components/BackgroundAnimation";
import AppCloseRefreshButtons from "./components/AppCloseRefreshButtons";
import NavBar from "./components/NavBar";
import ContentPanel from "./components/ContentPanel";
import StatusBar from "./components/StatusBar";
import Toaster from "./components/Toaster";
import SettingsPage from "./pages/SettingsPage";
import ChangelogPage from "./pages/ChangelogPage";
import AccountPage from "./pages/AccountPage";
import AppLayout from "./components/AppLayout";
import StatusBarAndContentPanel from "./components/StatusBarAndContentPanel";
import HorizontalFlex from "./components/layout/HorizontalFlex";
import {applyColorsToCSS} from "./theme/colors";
import {createTheme, ThemeProvider, CssBaseline, GlobalStyles} from "@mui/material";
import LibraryPage from "./pages/LibraryPage";
import StorePage from "./pages/StorePage";
import CustomCursor from './components/common/CustomCursor';

const App = () => {
    const [muiTheme] = useState(
        createTheme({
            palette: {
                mode: "dark",
                primary: {
                    main: "#07d400",
                },
                secondary: {
                    main: "#ff4081",
                },
                background: {
                    default: "#000000",
                    paper: "#000000",
                },
                text: {
                    primary: "#ffffff",
                    secondary: "#cccccc",
                },
                divider: "#444444",
            },
            components: {
                MuiButton: {
                    styleOverrides: {
                        root: {
                            backgroundColor: "#333333",
                            color: "#ffffff",
                            "&:hover": {
                                backgroundColor: "#1f1f1f",
                            },
                        },
                    },
                },
                MuiTextField: {
                    styleOverrides: {
                        root: {
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "#000000",
                                color: "#ffffff",
                                "& fieldset": {
                                    borderColor: "#444444",
                                },
                            },
                        },
                    },
                },
            },
        })
    );

    useEffect(() => {
        // Load initial theme from settings
        if (window.electronAPI) {
            window.electronAPI.getSettings().then((settings) => {
                applyColorsToCSS();
            });
        }
    }, []);

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <GlobalStyles
                styles={{
                    '*': {
                        cursor: 'none !important',
                    },
                    'a, button, [role="button"], input, select, textarea': {
                        cursor: 'none !important',
                    },
                }}
            />
            <CustomCursor />
            <Router>
                <AppLayout>
                    <BackgroundAnimation/>
                    <NavBar/>
                    <StatusBarAndContentPanel>
                        <HorizontalFlex>
                            <StatusBar/>
                            <AppCloseRefreshButtons></AppCloseRefreshButtons>
                        </HorizontalFlex>
                        <ContentPanel>
                            <Routes>
                                <Route path="/" element={<StorePage/>}/>
                                <Route path="/library" element={<LibraryPage/>}/>
                                <Route path="/account/*" element={<AccountPage/>}/>
                                <Route path="/settings" element={<SettingsPage/>}/>
                                <Route path="/changelog" element={<ChangelogPage/>}/>
                            </Routes>
                        </ContentPanel>
                    </StatusBarAndContentPanel>
                    <Toaster/>
                </AppLayout>
            </Router>
        </ThemeProvider>
    );
};

export default App;
