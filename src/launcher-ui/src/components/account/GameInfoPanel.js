import React, {useCallback, useEffect, useState} from "react";
import {Box, Button, Dialog, DialogContent, DialogTitle, Stack, Tab, Tabs, Typography, TextField, CircularProgress} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ErrorIcon from "@mui/icons-material/Error";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import UploadIcon from '@mui/icons-material/Upload';
import {colors} from "../../theme/colors";
import Cookies from "js-cookie";

const GameInfoPanel = ({game}) => {
    const [workflows, setWorkflows] = useState([]);
    const [logs, setLogs] = useState("");
    const [, setLoadingLogs] = useState(false);
    const [activeTab, setActiveTab] = useState("gameInfo");
    const [logPopupOpen, setLogPopupOpen] = useState(false);
    const [deployStatus, setDeployStatus] = useState("unknown");
    const [currentAccessToken, setCurrentAccessToken] = useState(null);
    const [manualVersion, setManualVersion] = useState("");
    const [versionError, setVersionError] = useState("");
    const [gameFile, setGameFile] = useState(null);
    const [gameFileName, setGameFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Find the correct installation ID and access token for this game's repo
    const findGameCredentials = useCallback(async () => {
        let count = 1;
        while (true) {
            const installationId = Cookies.get(`githubInstallationId${count}`);
            const accessToken = Cookies.get(`githubAccessToken${count}`);
            
            if (!installationId || !accessToken) break;

            try {
                // Check if this installation has access to the game's repo
                const response = await fetch(`https://api.github.com/repos/${game.github_repo}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: "application/vnd.github+json",
                    },
                });

                if (response.ok) {
                    setCurrentAccessToken(accessToken);
                    return installationId;
                }
            } catch (err) {
                console.error(`Error checking repo access for installation ${count}:`, err);
            }

            count++;
        }
        return null;
    }, [game.github_repo]);

    const fetchWorkflows = useCallback(async () => {
        if (!game.github_repo) return;

        const installationId = await findGameCredentials();
        if (!installationId || !currentAccessToken) {
            console.log("❌ No valid GitHub credentials found for this repository");
            return;
        }

        const runs = await window.githubAPI.fetchWorkflows(game.github_repo, currentAccessToken);
        setWorkflows(runs);

        if (runs.length > 0) {
            const latestRun = runs[0];
            const status = latestRun.conclusion || latestRun.status;
            setDeployStatus(status || "unknown");
        }
    }, [game.github_repo, currentAccessToken, findGameCredentials]);

    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    const fetchLogs = async (runId) => {
        if (!runId || !currentAccessToken) return;
        setLoadingLogs(true);

        const logData = await window.githubAPI.fetchLogs(game.github_repo, runId, currentAccessToken);

        setLoadingLogs(false);
        setLogs(logData);
        setLogPopupOpen(true);
    };

    // Get icon and color for workflow status
    const getWorkflowStatus = (status) => {
        switch (status) {
            case "success":
                return {color: colors.success, icon: <CheckCircleIcon fontSize="small"/>};
            case "in_progress":
                return {color: colors.primary, icon: <PlayCircleOutlineIcon fontSize="small"/>};
            case "queued":
                return {color: colors.warning, icon: <HourglassEmptyIcon fontSize="small"/>};
            case "failure":
            case "failed":
                return {color: colors.error, icon: <ErrorIcon fontSize="small"/>};
            default:
                return {color: colors.textSecondary, icon: <HelpOutlineIcon fontSize="small"/>};
        }
    };

    const handleRepoClick = async () => {
        if (!game.github_repo) return;

        const installationId = await findGameCredentials();
        if (!installationId) {
            console.error("❌ No valid installation ID found for this repository.");
            window.electronAPI?.showCustomNotification("Reinitialized Unsuccessful", "No valid GitHub installation found. Try re-authorizing the GitHub app.");
            return;
        }

        try {
            const response = await fetch("https://api.diabolical.studio/github-app/webhook", {
                method: "POST", 
                headers: {"Content-Type": "application/json"}, 
                body: JSON.stringify({
                    event: "game_created",
                    repository: game.github_repo,
                    game_id: game.game_id.trim(),
                    installation_id: installationId,
                }),
            });

            const contentType = response.headers.get("content-type");
            const responseData = contentType && contentType.includes("application/json") ? await response.json() : await response.text();

            if (!response.ok) {
                console.error(`❌ GitHub workflow re-trigger failed: ${responseData.message || responseData}`);
                window.electronAPI?.showCustomNotification("Reinitialized Unsuccessful", responseData.message || responseData || "Something went wrong!");
                return;
            }

            console.log("✅ GitHub workflow re-triggered successfully.");
            window.electronAPI?.showCustomNotification("Reinitialized Successfully", "Secrets and the workflow file will be recreated.");
        } catch (error) {
            console.error("❌ Error re-triggering GitHub workflow:", error);
            window.electronAPI?.showCustomNotification("Reinitialized Unsuccessful", "An unexpected error occurred. Check your internet connection and try again.");
        }
    };

    const handleAuthorizeMoreRepos = () => {
        const githubAppAuthUrl = "https://github.com/apps/diabolical-launcher-integration/installations/select_target";
        window.electronAPI.openExternal(githubAppAuthUrl);
    };

    const handleGameFileSelect = (file) => {
        if (file && file.name.endsWith('.zip')) {
            setGameFile(file);
            setGameFileName(file.name);
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("File Selected", "Your game file is ready to be uploaded.");
            }
        } else {
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Invalid File", "Please select a ZIP file.");
            }
        }
    };

    const validateVersion = (version) => {
        const versionRegex = /^\d+\.\d+\.\d+$/;
        return versionRegex.test(version);
    };

    const handleVersionChange = (e) => {
        const newVersion = e.target.value;
        setManualVersion(newVersion);
        
        if (newVersion && !validateVersion(newVersion)) {
            setVersionError("Version must be in format X.Y.Z (e.g., 1.0.0)");
        } else {
            setVersionError("");
        }
    };

    const handleManualUpload = async () => {
        if (versionError || !manualVersion || !gameFile) {
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // First, upload the game file
            const res = await fetch(`/.netlify/functions/generateUploadUrl`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileExt: gameFile.name.split('.').pop(),
                    contentType: gameFile.type,
                    isGameUpload: true,
                    gameId: game.game_id.trim(),
                    version: manualVersion
                })
            });
            const { url } = await res.json();

            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    setUploadProgress(progress);
                }
            });

            await new Promise((resolve, reject) => {
                xhr.onload = resolve;
                xhr.onerror = reject;
                xhr.open('PUT', url);
                xhr.setRequestHeader('Content-Type', gameFile.type);
                xhr.send(gameFile);
            });

            // After successful upload, update the game version in the database
            const sessionID = Cookies.get("sessionID");
            if (!sessionID) {
                throw new Error("No session ID found");
            }

            const updateResponse = await fetch("/update-game", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "sessionID": sessionID,
                },
                body: JSON.stringify({
                    game_id: game.game_id,
                    version: manualVersion
                }),
            });

            if (!updateResponse.ok) {
                throw new Error("Failed to update game version");
            }

            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Upload Successful", "Your game build has been uploaded and version updated successfully.");
            }
        } catch (err) {
            console.error("❌ Upload failed:", err);
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Upload Failed", err.message || "Could not upload your game file.");
            }
        } finally {
            setIsUploading(false);
        }
    };

    const gameDetails = {
        "Game Name": game.game_name,
        "Team": game.team_name,
        "Game ID": game.game_id,
        "Version": game.version,
        "Repository": game.github_repo ? (<Box
            component="a"
            onClick={() => window.electronAPI.openExternal(`https://github.com/${game.github_repo}`)}
            target="_blank"
            sx={{
                display: "flex",
                alignItems: "center",
                color: colors.success,
                fontWeight: "bold",
                textDecoration: "none",
                border: `1px solid ${colors.success}`,
                padding: "6px 12px",
                borderRadius: "2px",
                cursor: "pointer",
                "&:hover": {backgroundColor: "rgba(255, 255, 255, 0.1)"},
            }}
        >
            <OpenInNewIcon fontSize="small" sx={{marginRight: 1}}/>
            {game.github_repo}
        </Box>) : "No Repo Linked",
        "Deploy Status": game.github_repo ? (deployStatus === "unknown" ? (// Show reauth button when deploy status is unknown
            <Button
                variant="outlined"
                onClick={handleAuthorizeMoreRepos}
                sx={{
                    color: colors.warning,
                    borderColor: colors.warning,
                    fontWeight: "bold",
                    textTransform: "none",
                    "&:hover": {backgroundColor: "rgba(255, 255, 255, 0.1)"},
                }}
            >
                Reauthorize GitHub App
            </Button>) : (<Box
            sx={{
                display: "flex", alignItems: "center", color: getWorkflowStatus(deployStatus).color, fontWeight: "bold",
            }}
        >
            {getWorkflowStatus(deployStatus).icon}
            <Typography variant="body2" sx={{marginLeft: 1}}>
                {deployStatus.toUpperCase()}
            </Typography>
        </Box>)) : "No Repo Linked",
    };

    const githubAppDetails = {
        "App Name": "Diabolical Launcher Integration",
        "Team": "Diabolical Studios",
        "REINITIALIZE": game.github_repo ? (
            <Box sx={{display: "flex", flexDirection: "column", alignItems: "flex-end", width: "100%", gap: "12px"}}>
                {/* Reinitialize Button */}
                <Box
                    component="button"
                    onClick={handleRepoClick}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        color: colors.error,
                        fontWeight: "bold",
                        textDecoration: "none",
                        border: `1px solid ${colors.error}`,
                        padding: "6px 12px",
                        borderRadius: "2px",
                        cursor: "pointer",
                        background: "none",
                        outline: "none",
                        "&:hover": {backgroundColor: "rgba(255, 255, 255, 0.1)"},
                    }}
                >
                    <OpenInNewIcon fontSize="small" sx={{marginRight: 1}}/>
                    {game.github_repo}
                </Box>
                <Typography
                    variant="caption"
                    sx={{
                        display: "block", width: "50%", color: colors.warning, fontSize: "12px", textAlign: "center",
                    }}
                >
                    ⚠️ Reinitialization will recreate the secrets and workflow file! Be sure before proceeding.
                </Typography>
            </Box>) : "No Repo Linked",
    };

    return (<Stack
        sx={{
            width: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "12px",
            borderRadius: "2px",
            color: colors.text,
            border: `1px solid ${colors.border}`,
            overflow: "hidden",
        }}
    >
        {/* Top Tabs Navigation */}
        <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
                marginBottom: 1, borderBottom: `1px solid ${colors.border}`
            }}
        >
            <Tab value="gameInfo" label="Game Info" sx={{color: colors.text}}/>
            {!game.github_repo && <Tab value="manualUpload" label="Manual Upload" sx={{color: colors.text}}/>}
            {game.github_repo && <Tab value="workflowLogs" label="Workflow Logs" sx={{color: colors.text}}/>}
            {game.github_repo && <Tab value="githubApp" label="Github App" sx={{color: colors.text}}/>}
        </Tabs>

        {/* Game Info Tab */}
        {activeTab === "gameInfo" && (<Stack>
            {Object.entries(gameDetails).map(([key, value]) => (<Box
                key={key}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                }}
            >
                <Typography variant="body2" sx={{color: colors.textSecondary}}>
                    {key}:
                </Typography>
                {value}
            </Box>))}
        </Stack>)}

        {/* Manual Upload Tab */}
        {activeTab === "manualUpload" && (
            <Stack spacing={2} sx={{ padding: 2, height: "100%" }}>
                <Stack direction="row" spacing={1} alignItems="start">
                    <TextField
                        label="Version"
                        value={manualVersion}
                        onChange={handleVersionChange}
                        error={!!versionError}
                        helperText={versionError || "Enter version in format X.Y.Z (e.g., 1.0.0)"}
                        fullWidth
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: colors.text,
                                '& fieldset': {
                                    borderColor: colors.border,
                                },
                                '&:hover fieldset': {
                                    borderColor: colors.primary,
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: colors.textSecondary,
                            },
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleManualUpload}
                        disabled={!!versionError || !manualVersion || !gameFile || isUploading}
                        sx={{
                            minWidth: '48px',
                            height: '56px',
                            backgroundColor: colors.primary,
                            color: colors.text,
                            '&:hover': {
                                backgroundColor: colors.primaryDark,
                            },
                        }}
                    >
                        {isUploading ? <CircularProgress size={24} /> : <UploadIcon />}
                    </Button>
                </Stack>

                <Stack
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = colors.button;
                        e.currentTarget.style.backgroundColor = `${colors.button}20`;
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = colors.border;
                        e.currentTarget.style.backgroundColor = colors.background;
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = colors.border;
                        e.currentTarget.style.backgroundColor = colors.background;
                        const file = e.dataTransfer.files[0];
                        handleGameFileSelect(file);
                    }}
                    onClick={() => document.getElementById('game-file-upload')?.click()}
                    style={{
                        height: '100%',
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "4px",
                        border: `2px dashed ${colors.border}`,
                        backgroundColor: colors.background,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                    }}
                >
                    <input
                        id="game-file-upload"
                        hidden
                        type="file"
                        accept=".zip"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            handleGameFileSelect(file);
                        }}
                    />
                    {isUploading ? (
                        <Stack alignItems="center" gap={1}>
                            <CircularProgress size={24} />
                            <span style={{ color: colors.text }}>Uploading... {Math.round(uploadProgress)}%</span>
                        </Stack>
                    ) : gameFile ? (
                        <Stack alignItems="center" gap={1}>
                            <UploadIcon style={{ color: colors.button }} />
                            <span style={{ color: colors.text }}>Game File Selected ✅</span>
                            <span style={{ color: colors.border, fontSize: "12px" }}>{gameFileName}</span>
                            <span style={{ color: colors.border, fontSize: "12px" }}>Click or drag to change</span>
                        </Stack>
                    ) : (
                        <Stack alignItems="center" gap={1}>
                            <UploadIcon style={{ color: colors.border }} />
                            <span style={{ color: colors.text }}>Upload Game File</span>
                            <span style={{ color: colors.border, fontSize: "12px" }}>Supports ZIP files only</span>
                        </Stack>
                    )}
                </Stack>
            </Stack>
        )}

        {/* githubApp Info Tab */}
        {activeTab === "githubApp" && (<Stack>
            {Object.entries(githubAppDetails).map(([key, value]) => (<Box
                key={key}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                }}
            >
                <Typography variant="body2" sx={{color: colors.textSecondary}}>
                    {key}:
                </Typography>
                {value}
            </Box>))}
        </Stack>)}

        {/* Workflow Logs Tab */}
        {activeTab === "workflowLogs" && (<Stack spacing={2}>
            {workflows.length > 0 ? (<>
                <Typography variant="h6" sx={{color: colors.textSecondary}}>
                    GitHub Actions Logs
                </Typography>

                {/* List of Workflow Runs */}
                <Stack spacing={1} sx={{maxHeight: "200px", overflowY: "auto"}}>
                    {workflows.map((run, index) => {
                        const {color, icon} = getWorkflowStatus(run.conclusion || run.status);
                        return (<Box
                            key={run.id}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                color: color,
                                fontWeight: "bold",
                                padding: "10px 8px",
                                cursor: "pointer",
                                "&:hover": {backgroundColor: "rgba(255, 255, 255, 0.1)"},
                                borderBottom: index !== workflows.length - 1 ? `1px solid ${colors.border}` : "none"
                            }}
                            onClick={() => fetchLogs(run.id)}
                        >
                            {icon}
                            <Typography variant="body2" sx={{marginLeft: 1}}>
                                {run.display_title || `Run #${run.run_number}`} - {(run.conclusion || run.status).toUpperCase()}
                            </Typography>
                        </Box>);
                    })}
                </Stack>
            </>) : (<Typography sx={{color: colors.textSecondary}}>
                No GitHub workflows found for this repository.
            </Typography>)}
        </Stack>)}

        {/* Log Viewer Popup */}
        <Dialog
            open={logPopupOpen}
            onClose={() => setLogPopupOpen(false)}
            fullWidth
            maxWidth="md"
            sx={{
                "& .MuiDialog-paper": {
                    backgroundColor: "rgba(0,0,0,0.9)",
                    color: colors.text,
                    outline: "1px solid" + colors.border,
                    borderRadius: "2px"
                },
            }}
        >
            <DialogTitle>GitHub Actions Logs</DialogTitle>
            <DialogContent>
                <pre style={{whiteSpace: "pre-wrap"}}>{logs}</pre>
            </DialogContent>
        </Dialog>
    </Stack>);
};

export default GameInfoPanel;
