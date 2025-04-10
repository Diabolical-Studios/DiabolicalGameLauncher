import React, {useCallback, useEffect, useState} from "react";
import {Box, Button, Dialog, DialogContent, DialogTitle, Stack, Tab, Tabs, Typography} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ErrorIcon from "@mui/icons-material/Error";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
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
            <Tab value="workflowLogs" label="Workflow Logs" sx={{color: colors.text}}/>
            <Tab value="githubApp" label="Github App" sx={{color: colors.text}}/>
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
