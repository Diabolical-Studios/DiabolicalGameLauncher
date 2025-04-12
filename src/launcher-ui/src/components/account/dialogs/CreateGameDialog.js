import React, {useEffect, useState, useCallback} from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Chip,
    Tabs,
    Tab,
} from "@mui/material";
import {styled} from "@mui/material/styles";
import GameCard from "../../GameCard";
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import UploadIcon from '@mui/icons-material/Upload';
import Cookies from "js-cookie";
import {colors} from "../../../theme/colors";
import ImageUploader from "../../common/ImageUploader";
import { getAllInstallationPairs } from "../../../pages/AccountPage";

const StyledDialog = styled(Dialog)(({theme}) => ({
    "& .MuiDialog-paper": {
        maxHeight: "none", minWidth: "80%", background: "transparent", boxShadow: "none", margin: 0,
    }
}));

const CreateGameDialog = ({open, handleClose, onSave, teams}) => {
    const [gameName, setGameName] = useState("");
    const [gameId, setGameId] = useState("");
    const [gameBackgroundUrl, setGameBackgroundUrl] = useState("");
    const [gameDescription, setGameDescription] = useState("");
    const [gameVersion, setGameVersion] = useState("0.0.1");
    const [selectedTeam, setSelectedTeam] = useState("");
    const [teamIconUrl, setTeamIconUrl] = useState("");
    const [githubRepos, setGithubRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState("");
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasRequiredFields, setHasRequiredFields] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [connectedAccounts, setConnectedAccounts] = useState([]);
    const [ownerAvatars, setOwnerAvatars] = useState({});
    const [activeTab, setActiveTab] = useState(0);
    const [gameFile, setGameFile] = useState(null);
    const [gameFileName, setGameFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (teams && teams.length > 0) {
            setSelectedTeam(teams[0].team_id);
            setTeamIconUrl(teams[0].team_icon_url);
        }
    }, [teams]);

    useEffect(() => {
        const hasAllRequiredFields = 
            gameName?.trim() && 
            gameId?.trim() && 
            selectedTeam && 
            gameBackgroundUrl &&
            ((activeTab === 0 && selectedRepo) || (activeTab === 1 && gameFile && validateVersion(gameVersion)));
        setHasRequiredFields(!!hasAllRequiredFields);
    }, [gameName, gameId, selectedTeam, selectedRepo, gameBackgroundUrl, activeTab, gameFile, gameVersion]);

    const fetchGithubRepos = useCallback(async (installationId, accessToken) => {
        if (!installationId || !accessToken) {
            console.log("❌ Missing GitHub Installation ID or Access Token.");
            return;
        }

        try {
            const reposResponse = await fetch(`https://api.github.com/installation/repositories`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github+json",
                },
            });

            if (!reposResponse.ok) {
                throw new Error(`Failed to fetch repositories. Status: ${reposResponse.status}`);
            }

            const data = await reposResponse.json();
            
            // Get account info and store avatar URLs
            if (data.repositories.length > 0) {
                const accountName = data.repositories[0].owner.login;
                const avatarUrl = data.repositories[0].owner.avatar_url;
                setConnectedAccounts(prev => [...prev.filter(acc => acc.id !== installationId), {
                    id: installationId,
                    name: accountName,
                    type: data.repositories[0].owner.type,
                    avatarUrl: avatarUrl
                }]);

                // Store avatar URL for this owner
                setOwnerAvatars(prev => ({
                    ...prev,
                    [accountName]: avatarUrl
                }));
            }

            // Add repos to the list
            setGithubRepos(prev => [...prev, ...data.repositories]);
        } catch (error) {
            console.error("❌ Error fetching repositories:", error);
        }
    }, []);

    useEffect(() => {
        const loadRepositories = async () => {
            const pairs = getAllInstallationPairs();
            
            if (pairs.length > 0) {
                console.log("✅ Found existing GitHub installations:", pairs);
                setLoadingRepos(true);
                setGithubRepos([]); // Clear existing repos
                
                // Process all installations
                for (const pair of pairs) {
                    await fetchGithubRepos(pair.installationId, pair.accessToken);
                }
                
                setLoadingRepos(false);
            } else {
                console.log("❌ No GitHub installations found");
            }
        };

        if (open) {
            loadRepositories();
        }
    }, [open, fetchGithubRepos]);

    useEffect(() => {
        const handleProtocolData = (action, data) => {
            console.log("🔄 Handling Protocol Data:", action, data);

            if (action === "github-app") {
                console.log("✅ GitHub App Authentication Successful");
                // Fetch repos for the new installation
                fetchGithubRepos(data.githubInstallationId, data.githubAccessToken);
            }
        };

        if (window.electronAPI) {
            window.electronAPI.onProtocolData(handleProtocolData);
            return () => {
                window.electronAPI.onProtocolData(null);
            };
        }
    }, [fetchGithubRepos]);

    // Calculate filtered repos
    const filteredRepos = githubRepos.filter(repo => 
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
        setGameVersion(newVersion);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const sessionID = Cookies.get("sessionID");
        if (!sessionID) {
            console.error("❌ No session ID found.");
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Game Creation Failed", "Please try again later");
            }
            setIsSaving(false);
            return;
        }

        if (!selectedTeam) {
            console.error("❌ No team selected.");
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Game Creation Failed", "Please select a team");
            }
            setIsSaving(false);
            return;
        }

        if (activeTab === 1 && !validateVersion(gameVersion)) {
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Invalid Version", "Version must be in format X.Y.Z (e.g., 1.0.0)");
            }
            setIsSaving(false);
            return;
        }

        // Handle file upload if in manual upload mode
        if (activeTab === 1 && gameFile) {
            setIsUploading(true);
            setUploadProgress(0);
            try {
                const res = await fetch(`/.netlify/functions/generateUploadUrl`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fileExt: gameFile.name.split('.').pop(),
                        contentType: gameFile.type,
                        isGameUpload: true,
                        gameId: gameId.trim(),
                        version: gameVersion
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

            } catch (err) {
                console.error("❌ Upload failed:", err);
                if (window.electronAPI) {
                    window.electronAPI.showCustomNotification("Upload Failed", "Could not upload your game file.");
                }
                setIsSaving(false);
                setIsUploading(false);
                return;
            } finally {
                setIsUploading(false);
            }
        }

        // Find the correct installation ID for this repository if in GitHub mode
        let installationId = null;
        if (activeTab === 0) {
            let count = 1;
            while (true) {
                const currentInstallationId = Cookies.get(`githubInstallationId${count}`);
                const currentAccessToken = Cookies.get(`githubAccessToken${count}`);
                
                if (!currentInstallationId || !currentAccessToken) break;

                try {
                    // Check if this installation has access to the selected repo
                    const response = await fetch(`https://api.github.com/repos/${selectedRepo}`, {
                        headers: {
                            Authorization: `Bearer ${currentAccessToken}`,
                            Accept: "application/vnd.github+json",
                        },
                    });

                    if (response.ok) {
                        installationId = currentInstallationId;
                        break;
                    }
                } catch (err) {
                    console.error(`Error checking repo access for installation ${count}:`, err);
                }

                count++;
            }

            if (!installationId) {
                if (window.electronAPI) {
                    window.electronAPI.showCustomNotification("Game Creation Failed", "No GitHub installation found with access to this repository");
                }
                console.error("❌ No GitHub Installation ID found with access to the selected repository.");
                setIsSaving(false);
                return;
            }
        }

        const newGame = {
            game_name: gameName.trim(),
            game_id: gameId.trim(),
            background_image_url: gameBackgroundUrl.trim(),
            description: gameDescription.trim(),
            version: gameVersion,
            team_name: selectedTeam,
            team_icon_url: teamIconUrl,
            ...(activeTab === 0 ? { github_repo: selectedRepo } : {  }),
        };

        console.log("📤 Sending game creation request:", newGame);

        try {
            // Attempt to create the game via the Netlify function
            const response = await fetch("/create-game", {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json", 
                    "sessionID": sessionID,
                }, 
                body: JSON.stringify(newGame),
            });

            if (!response.ok) {
                if (window.electronAPI) {
                    window.electronAPI.showCustomNotification("Game Creation Failed", "Netlify did not respond.");
                }
                throw new Error("Failed to create game via Netlify.");
            }

            console.log("✅ Game created successfully:", newGame);

            // Only notify GitHub if the Netlify step succeeded and we're in GitHub mode
            if (activeTab === 0) {
                const githubWebhookResponse = await fetch("https://api.diabolical.studio/github-app/webhook", {
                    method: "POST", 
                    headers: {
                        "Content-Type": "application/json",
                    }, 
                    body: JSON.stringify({
                        event: "game_created",
                        repository: selectedRepo,
                        game_id: gameId.trim(),
                        installation_id: installationId,
                    }),
                });

                if (!githubWebhookResponse.ok) {
                    if (window.electronAPI) {
                        window.electronAPI.showCustomNotification("Game Creation Failed", "Github App did not respond.");
                    }
                    throw new Error("Failed to notify GitHub App.");
                }

                console.log("✅ GitHub App notified to create workflow.");
            }

            // Send the notification via main process.
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Game Created", "Your game was successfully created!");
            }

            handleClose();
        } catch (err) {
            console.error("❌ Error creating game:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleTeamChange = (e) => {
        const selectedTeamName = e.target.value;
        setSelectedTeam(selectedTeamName);
        const team = teams.find((team) => team.team_name === selectedTeamName);
        setTeamIconUrl(team ? team.team_icon_url : "");
    };

    const handleAuthorizeMoreRepos = () => {
        const githubAppAuthUrl = "https://github.com/apps/diabolical-launcher-integration/installations/select_target";
        window.electronAPI.openExternal(githubAppAuthUrl);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (<StyledDialog open={open} container={document.getElementById("root")}
                          onClose={handleClose} aria-labelledby="create-game-dialog-title">
        <Stack className={"p-6 overflow-hidden"}>
            <Stack className={"dialog gap-6 p-4"} flexDirection={"column"} style={{
                backgroundColor: colors.background, border: "1px solid" + colors.border, gap: "24px", padding: "0 24px 24px 24px"
            }}>
                {/* Tabs at the top */}
                <Stack width="100%" sx={{ borderBottom: 1, borderColor: colors.border }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTabs-indicator': {
                                backgroundColor: colors.button,
                            },
                        }}
                    >
                        <Tab 
                            label="Deploy from GitHub" 
                            sx={{
                                color: colors.text,
                                '&.Mui-selected': {
                                    color: colors.button,
                                },
                            }}
                        />
                        <Tab 
                            label="Manual Upload" 
                            sx={{
                                color: colors.text,
                                '&.Mui-selected': {
                                    color: colors.button,
                                },
                            }}
                        />
                    </Tabs>
                </Stack>

                <div style={{display: "flex", flexDirection: "row", gap: "24px"}}>
{/* Left side - Game Card */}
<Stack width={"min-content"} alignItems="center" className={"gap-6 justify-between rounded-xs"} style={{
                    gap: "24px"
                }}>
                    <GameCard
                        style={{aspectRatio: "63/88", outline: "1px solid" + colors.border, width: "auto"}}
                        game={{
                            game_name: gameName,
                            game_id: gameId,
                            background_image_url: gameBackgroundUrl,
                            description: gameDescription,
                            version: gameVersion,
                        }}
                        isEditing={true}
                        setGameName={setGameName}
                        setGameId={setGameId}
                        setGameBackgroundUrl={setGameBackgroundUrl}
                        setGameDescription={setGameDescription}
                    />
                    <Stack className={"w-full"} style={{margin: 0, gap: "12px"}}>
                        <Stack style={{gap: "12px"}} direction={"row"}>
                            <TextField
                                label="Game ID"
                                variant="outlined"
                                fullWidth
                                value={gameId}
                                onChange={(e) => setGameId(e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        color: colors.text, fontSize: "16px",
                                    }, "& .MuiOutlinedInput-notchedOutline": {
                                        border: "1px solid" + colors.border + "!important", borderRadius: "4px"
                                    }, "& .MuiFormLabel-root": {
                                        color: "#444444 !important",
                                    },
                                }}
                            />
                            <FormControl fullWidth sx={{
                                "& .MuiSelect-select": {
                                    border: "1px solid" + colors.border + "!important",
                                    borderRadius: "4px",
                                    color: colors.text,
                                    padding: "16.5px 14px !important",
                                    height: "-webkit-fill-available",
                                },
                            }}>
                                <InputLabel id="team-select-label"
                                            style={{
                                                backgroundColor: colors.background,
                                                color: colors.border,
                                                padding: "0 8px"
                                            }}>Team</InputLabel>
                                <Select
                                    labelId="team-select-label"
                                    value={selectedTeam}
                                    label="Team"
                                    onChange={handleTeamChange}
                                    variant="outlined"
                                    sx={{
                                        "& .MuiOutlinedSelect-root": {
                                            color: colors.text, fontSize: "16px",
                                        }, "& .MuiOutlinedInput-notchedOutline": {
                                            border: "1px solid" + colors.border + "!important", borderRadius: "4px"
                                        }, "& .MuiFormLabel-root": {
                                            color: "#444444 !important",
                                        },
                                    }}
                                >
                                    {teams.map((team) => (<MenuItem
                                        style={{
                                            backgroundColor: colors.background,
                                            color: colors.border,
                                            padding: "0 !important"
                                        }}
                                        key={team.team_name}
                                        value={team.team_name}>
                                        {team.team_name}
                                    </MenuItem>))}
                                </Select>
                            </FormControl>
                        </Stack>
                        <ImageUploader
                            onUpload={(url) => {
                                setGameBackgroundUrl(url);
                                setHasRequiredFields(true);
                            }}
                            currentImageUrl={gameBackgroundUrl}
                            uploading={uploading}
                            setUploading={setUploading}
                        />
                    </Stack>
                </Stack>

                {/* Right side - Upload Method */}
                <Stack className={"items-end w-full gap-6 justify-between"}>
                    <Stack className={"gap-6 w-full flex-1"} style={{gap: "12px"}}>
                        {activeTab === 0 ? (
                            // GitHub Deployment Tab
                            <>
                                {connectedAccounts.length > 0 && (
                                    <Stack 
                                        direction="row" 
                                        spacing={2} 
                                        sx={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                            borderRadius: '4px',
                                            padding: '12px',
                                            border: `1px solid ${colors.border}`,
                                        }}
                                    >
                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" sx={{ color: colors.text }}>
                                                Connected GitHub Accounts
                                            </Typography>
                                            {connectedAccounts.map(account => (
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    <img 
                                                        src={account.avatarUrl} 
                                                        alt={account.name}
                                                        style={{
                                                            width: "24px", 
                                                            height: "24px",
                                                            borderRadius: "50%",
                                                            objectFit: "cover"
                                                        }}
                                                    />
                                                    <Typography 
                                                        key={account.id}
                                                        variant="body2" 
                                                        sx={{ 
                                                            color: colors.text,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1
                                                        }}
                                                    >
                                                        {account.name}
                                                        <Chip 
                                                            label={account.type} 
                                                            size="small"
                                                            sx={{ 
                                                                backgroundColor: 'rgba(0, 188, 212, 0.1)',
                                                                color: '#00bcd4',
                                                                height: '20px'
                                                            }}
                                                        />
                                                    </Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Stack>
                                )}

                                <TextField
                                    placeholder="Search repositories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            color: colors.text,
                                            fontSize: "14px",
                                            backgroundColor: "#161616",
                                            "& fieldset": {
                                                borderColor: colors.border,
                                            },
                                            "&:hover fieldset": {
                                                borderColor: "#00bcd4",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#00bcd4",
                                            },
                                        },
                                        "& .MuiInputBase-input": {
                                            padding: "10px 14px",
                                        },
                                    }}
                                />
                                
                                <Stack 
                                    className={"gap-2 flex-1"} 
                                    style={{
                                        backgroundColor: "#161616",
                                        borderRadius: "4px",
                                        overflow: "hidden",
                                        minHeight: "200px",
                                        border: `1px solid ${colors.border}`,
                                    }}
                                >
                                    <Stack 
                                        className={"gap-2"} 
                                        style={{
                                            height: "250px",
                                            padding: "8px",
                                            overflowY: "auto",
                                            scrollbarWidth: "thin",
                                            scrollbarColor: `${colors.border} transparent`,
                                        }}
                                    >
                                        {loadingRepos ? (
                                            <Stack alignItems="center" justifyContent="center" style={{ height: "100%" }}>
                                                <CircularProgress size={20}/>
                                                <p style={{color: colors.text, fontSize: "14px", margin: "8px 0 0"}}>
                                                    Loading Repositories...
                                                </p>
                                            </Stack>
                                        ) : (
                                            <>
                                                {filteredRepos.length === 0 ? (
                                                    <Stack alignItems="center" justifyContent="center" style={{ height: "100%" }}>
                                                        <p style={{color: colors.text, fontSize: "14px"}}>
                                                            {searchQuery ? "No repositories found" : "No repositories available"}
                                                        </p>
                                                    </Stack>
                                                ) : (
                                                    <>
                                                        {filteredRepos.map((repo) => (
                                                            <Stack
                                                                key={repo.id}
                                                                direction="row"
                                                                className={"justify-between items-center p-2 rounded-xs cursor-pointer"}
                                                                style={{
                                                                    transition: "background 0.2s",
                                                                    border: selectedRepo === repo.full_name ? "1px solid #00bcd4" : "transparent",
                                                                }}
                                                                onClick={() => setSelectedRepo(repo.full_name)}
                                                                onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
                                                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                                            >
                                                                <img
                                                                    src={ownerAvatars[repo.owner.login] || "/github.png"}
                                                                    alt={repo.owner.login}
                                                                    style={{
                                                                        aspectRatio: "1 / 1",
                                                                        width: "16px",
                                                                        borderRadius: "50%",
                                                                        objectFit: "cover"
                                                                    }}
                                                                />
                                                                <p style={{
                                                                    color: colors.text, 
                                                                    margin: 0, 
                                                                    fontSize: "14px", 
                                                                    flex: 1, 
                                                                    paddingLeft: "8px"
                                                                }}>
                                                                    {repo.full_name}
                                                                </p>
                                                                <Chip
                                                                    label={repo.private ? "Private" : "Public"}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: repo.private ? "rgba(255, 64, 129, 0.1)" : "rgba(0, 230, 118, 0.1)",
                                                                        color: repo.private ? "#ff4081" : "#00e676",
                                                                        height: "20px",
                                                                        fontSize: "12px",
                                                                        fontWeight: "bold",
                                                                    }}
                                                                />
                                                            </Stack>
                                                        ))}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Stack>
                                </Stack>

                                <Button
                                    variant="outlined"
                                    onClick={handleAuthorizeMoreRepos}
                                    sx={{
                                        color: "#00bcd4",
                                        borderColor: "#00bcd4",
                                        backgroundColor: "transparent",
                                        textTransform: "none",
                                        padding: "10px",
                                        borderRadius: "4px",
                                        "&:hover": {
                                            backgroundColor: "rgba(0, 188, 212, 0.1)",
                                            borderColor: "#00bcd4",
                                        }
                                    }}
                                >
                                    Can't find your repo? Authorize more repositories
                                </Button>
                            </>
                        ) : (
                            // Manual Upload Tab
                            <Stack spacing={2}>
                                <TextField
                                    label="Version"
                                    value={gameVersion}
                                    onChange={handleVersionChange}
                                    error={!validateVersion(gameVersion)}
                                    helperText={!validateVersion(gameVersion) ? "Version must be in format X.Y.Z (e.g., 1.0.0)" : ""}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            color: colors.text,
                                            fontSize: "14px",
                                            backgroundColor: "#161616",
                                            "& fieldset": {
                                                borderColor: colors.border,
                                            },
                                            "&:hover fieldset": {
                                                borderColor: "#00bcd4",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#00bcd4",
                                            },
                                        },
                                    }}
                                />
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
                                        height: '120px',
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
                    </Stack>

                    {/* Save Button */}
                    <Button
                        sx={{
                            color: "#fff !important",
                            backgroundColor: colors.button,
                            outline: "1px solid" + colors.border,
                            borderRadius: "4px",
                            justifyContent: "space-between",
                            padding: "10px 16px",
                            width: "fit-content",
                            opacity: !hasRequiredFields || isSaving ? 0.5 : 1,
                            transition: "opacity 0.2s ease-in-out",
                            "&:hover": {
                                opacity: !hasRequiredFields || isSaving ? 0.5 : 0.8,
                                backgroundColor: colors.button
                            }
                        }}
                        onClick={handleSave}
                        aria-label="save"
                        startIcon={<RocketLaunchIcon/>}
                        disabled={isSaving || !hasRequiredFields}
                    >
                        {isSaving ? <CircularProgress size={20} color="inherit"/> : "Create and Deploy Game!"}
                    </Button>
                </Stack>                </div>
            </Stack>
        </Stack>
    </StyledDialog>);
};

export default CreateGameDialog;
