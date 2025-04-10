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
    Chip
} from "@mui/material";
import {styled} from "@mui/material/styles";
import GameCard from "../../GameCard";
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'; 
import Cookies from "js-cookie";
import {colors} from "../../../theme/colors";
import ImageUploader from "../../common/ImageUploader";

const StyledDialog = styled(Dialog)(({theme}) => ({
    "& .MuiDialog-paper": {
        maxHeight: "none", maxWidth: "none", background: "transparent", boxShadow: "none", margin: 0,
    }
}));

const saveInstallationPair = (installationId, accessToken) => {
    // Find the next available number
    let count = 1;
    while (Cookies.get(`githubInstallationId${count}`)) {
        count++;
    }

    // Save the new pair
    Cookies.set(`githubInstallationId${count}`, installationId, {
        secure: true,
        sameSite: "Strict",
        expires: 7
    });
    Cookies.set(`githubAccessToken${count}`, accessToken, {
        secure: true,
        sameSite: "Strict",
        expires: 7
    });
};

const getAllInstallationPairs = () => {
    const pairs = [];
    let count = 1;
    
    while (true) {
        const installationId = Cookies.get(`githubInstallationId${count}`);
        const accessToken = Cookies.get(`githubAccessToken${count}`);
        
        if (!installationId || !accessToken) break;
        
        pairs.push({ installationId, accessToken });
        count++;
    }
    
    return pairs;
};

const CreateGameDialog = ({open, handleClose, onSave, teams}) => {
    const [gameName, setGameName] = useState("");
    const [gameId, setGameId] = useState("");
    const [gameBackgroundUrl, setGameBackgroundUrl] = useState("");
    const [gameDescription, setGameDescription] = useState("");
    const [gameVersion] = useState("0.0.1");
    const [selectedTeam, setSelectedTeam] = useState("");
    const [teamIconUrl, setTeamIconUrl] = useState("");
    const [githubRepos, setGithubRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState("");
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasRequiredFields, setHasRequiredFields] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [connectedAccounts, setConnectedAccounts] = useState([]);
    const [ownerAvatars, setOwnerAvatars] = useState({});

    useEffect(() => {
        if (teams && teams.length > 0) {
            setSelectedTeam(teams[0].team_id);
            setTeamIconUrl(teams[0].team_icon_url);
        }
    }, [teams]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const hasAllRequiredFields = 
            gameName?.trim() && 
            gameId?.trim() && 
            selectedTeam && 
            selectedRepo &&
            gameBackgroundUrl;
        setHasRequiredFields(!!hasAllRequiredFields);
    }, [gameName, gameId, selectedTeam, selectedRepo, gameBackgroundUrl]);

    const fetchGithubRepos = useCallback(async (installationId, accessToken) => {
        if (!installationId || !accessToken) {
            console.log("❌ Missing GitHub Installation ID or Access Token.");
            return;
        }

        setLoadingRepos(true);
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

            // Find the next pair to process
            let nextCount = 1;
            let foundCurrent = false;
            while (true) {
                const nextInstallationId = Cookies.get(`githubInstallationId${nextCount}`);
                const nextAccessToken = Cookies.get(`githubAccessToken${nextCount}`);
                
                if (!nextInstallationId || !nextAccessToken) break;
                
                if (foundCurrent) {
                    // Process the next pair
                    fetchGithubRepos(nextInstallationId, nextAccessToken);
                    break;
                }
                
                if (nextInstallationId === installationId) {
                    foundCurrent = true;
                }
                
                nextCount++;
            }
        } catch (error) {
            console.error("❌ Error fetching repositories:", error);
        } finally {
            setLoadingRepos(false);
        }
    }, []);

    useEffect(() => {
        const loadInstallations = () => {
            const pairs = [];
            let count = 1;
            
            // Get all installation pairs
            while (true) {
                const installationId = Cookies.get(`githubInstallationId${count}`);
                const accessToken = Cookies.get(`githubAccessToken${count}`);
                
                if (!installationId || !accessToken) break;
                
                pairs.push({ installationId, accessToken });
                count++;
            }
            
            if (pairs.length > 0) {
                console.log("✅ Found existing GitHub installations");
                // Start with the first pair
                fetchGithubRepos(pairs[0].installationId, pairs[0].accessToken);
            } else {
                console.log("❌ No GitHub installations found");
            }
        };

        loadInstallations();
    }, [fetchGithubRepos]);

    useEffect(() => {
        const handleProtocolData = (action, data) => {
            console.log("🔄 Handling Protocol Data:", action, data);

            if (action === "github-app") {
                console.log("✅ GitHub App Authentication Successful");
                
                // Check if this installation already exists
                const pairs = getAllInstallationPairs();
                const exists = pairs.some(pair => pair.installationId === data.githubInstallationId);
                
                if (!exists) {
                    // Save the new pair
                    saveInstallationPair(data.githubInstallationId, data.githubAccessToken);
                    // Fetch repos for the new installation
                    fetchGithubRepos(data.githubInstallationId, data.githubAccessToken);
                } else {
                    console.log("⚠️ Installation already exists, skipping...");
                }
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

    const handleSave = async () => {
        setIsSaving(true); // Disable the button while processing
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

        if (!selectedRepo) {
            console.error("❌ No repository selected.");
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Game Creation Failed", "Please select a repository");
            }
            setIsSaving(false);
            return;
        }

        // Find the correct installation ID for this repository
        let installationId = null;
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

        const newGame = {
            game_name: gameName.trim(),
            game_id: gameId.trim(),
            background_image_url: gameBackgroundUrl.trim(),
            description: gameDescription.trim(),
            version: gameVersion,
            team_name: selectedTeam,
            team_icon_url: teamIconUrl,
            github_repo: selectedRepo,
        };

        console.log("📤 Sending game creation request:", newGame);

        try {
            // Attempt to create the game via the Netlify function
            const response = await fetch("/create-game", {
                method: "POST", headers: {
                    "Content-Type": "application/json", "sessionID": sessionID,
                }, body: JSON.stringify(newGame),
            });

            if (!response.ok) {
                if (window.electronAPI) {
                    window.electronAPI.showCustomNotification("Game Creation Failed", "Netlify did not respond.");
                }
                throw new Error("Failed to create game via Netlify.");
            }

            console.log("✅ Game created successfully:", newGame);

            // Only notify GitHub if the Netlify step succeeded.
            const githubWebhookResponse = await fetch("https://api.diabolical.studio/github-app/webhook", {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({
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

            // Send the notification via main process.
            if (window.electronAPI) {
                window.electronAPI.showCustomNotification("Game Created", "Your game was successfully created!");
            }

            handleClose();
        } catch (err) {
            console.error("❌ Error creating game:", err);
        } finally {
            setIsSaving(false); // Re-enable the button regardless of outcome
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

    return (<StyledDialog open={open} container={document.getElementById("root")}
                          onClose={handleClose} aria-labelledby="create-game-dialog-title">
        <Stack className={"p-6 overflow-hidden"}>
            <Stack className={"dialog gap-6 p-4"} flexDirection={isMobile ? "column" : "row"} style={{
                backgroundColor: colors.background, border: "1px solid" + colors.border, gap: "24px", padding: "24px"
            }}>
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
                            {/* Team Selection Dropdown */}
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
                        {/* Image Uploader */}
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
                <Stack className={"items-end w-full gap-6 justify-between"}>
                    <Stack className={"gap-6 w-full flex-1"} style={{gap: "12px"}}>
                        {/* Connected Accounts Display */}
                        {connectedAccounts.length > 0 && (
                            <Stack 
                                direction="row" 
                                spacing={2} 
                                sx={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                    borderRadius: '4px',
                                    padding: '12px',
                                    border: `1px solid ${colors.border}`
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

                        {/* Search Bar */}
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
                        
                        {/* GitHub Repository Selection */}
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
                                                        {/* Owner Avatar */}
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
                                                        {/* Repository Name */}
                                                        <p style={{
                                                            color: colors.text, 
                                                            margin: 0, 
                                                            fontSize: "14px", 
                                                            flex: 1, 
                                                            paddingLeft: "8px"
                                                        }}>
                                                            {repo.full_name}
                                                        </p>
                                                        {/* Repo Visibility (Public/Private) */}
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

                        {/* Link to authorize more repositories */}
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
                </Stack>
            </Stack>
        </Stack>
    </StyledDialog>);
};

export default CreateGameDialog;
