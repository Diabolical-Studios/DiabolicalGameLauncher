import React, {useEffect, useState} from "react";
import {
    Button, CircularProgress, Dialog, DialogContent, FormControl, InputLabel, Link, MenuItem, Select, Stack, TextField
} from "@mui/material";
import {styled} from "@mui/material/styles";
import GameCard from "../../GameCard";
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Cookies from "js-cookie";
import {colors} from "../../../theme/colors";


const StyledDialog = styled(Dialog)(({theme}) => ({
    "& .MuiDialog-paper": {
        width: "70vw",
        height: "90vh",
        maxHeight: "none",
        maxWidth: "none",
        background: "transparent",
        boxShadow: "none",
        margin: 0,
    }
}));

const CreateGameDialog = ({open, handleClose, onSave, teams}) => {
    const [gameName, setGameName] = useState();
    const [gameId, setGameId] = useState();
    const [gameBackgroundUrl, setGameBackgroundUrl] = useState("https://png.pngtree.com/element_our/20190530/ourmid/pngtree-white-spot-float-image_1256405.jpg");
    const [gameDescription, setGameDescription] = useState();
    const [gameVersion] = useState("0.0.1");
    const [selectedTeam, setSelectedTeam] = useState();
    const [teamIconUrl, setTeamIconUrl] = useState();
    const [githubRepos, setGithubRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState("");
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [refreshRepos, setRefreshRepos] = useState(false);

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

    const fetchGithubRepos = async () => {
        const installationId = Cookies.get("githubInstallationId");
        const accessToken = Cookies.get("githubAccessToken");

        if (!installationId || !accessToken) {
            console.log("❌ Missing GitHub Installation ID or Access Token.");
            return;
        }

        setLoadingRepos(true);
        try {
            const response = await fetch(`https://api.github.com/installation/repositories`, {
                method: "GET", headers: {
                    Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch repositories. Status: ${response.status}`);
            }

            const data = await response.json();
            setGithubRepos(data.repositories);
        } catch (error) {
            console.error("❌ Error fetching repositories:", error);
        } finally {
            setLoadingRepos(false);
        }
    };

    useEffect(() => {
        fetchGithubRepos();
    }, [refreshRepos]);


    useEffect(() => {
        const handleProtocolData = (action, data) => {
            console.log("🔄 Handling Protocol Data:", action, data);

            if (action === "github-app") {
                console.log("✅ GitHub App Authentication Successful. Storing credentials in cookies.");

                Cookies.set("githubInstallationId", data.githubInstallationId, {
                    secure: true, sameSite: "Strict", expires: 7
                });
                Cookies.set("githubAccessToken", data.githubAccessToken, {
                    secure: true, sameSite: "Strict", expires: 7
                });

                console.log("✅ Confirmed in cookies:", {
                    installationId: Cookies.get("githubInstallationId"), accessToken: Cookies.get("githubAccessToken"),
                });

                setTimeout(() => {
                    setRefreshRepos(prev => !prev);
                }, 1000);
            }
        };

        window.electronAPI.onProtocolData(handleProtocolData);

        return () => {
            window.electronAPI.onProtocolData(null);
        };
    }, []);

    const handleSave = async () => {
        const sessionID = Cookies.get("sessionID");
        if (!sessionID) {
            console.error("❌ No session ID found.");
            return;
        }

        if (!selectedTeam) {
            console.error("❌ No team selected.");
            return;
        }

        if (!selectedRepo) {
            console.error("❌ No repository selected.");
            return;
        }

        const installationId = Cookies.get("githubInstallationId");
        if (!installationId) {
            console.error("❌ No GitHub Installation ID found.");
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
            const response = await fetch("https://launcher.diabolical.studio/.netlify/functions/createGame", {
                method: "POST", headers: {
                    "Content-Type": "application/json", "sessionID": sessionID,
                }, body: JSON.stringify(newGame),
            });

            if (!response.ok) {
                throw new Error("Failed to create game.");
            }

            console.log("✅ Game created successfully:", newGame);

            await fetch("https://api.diabolical.studio/github-app/webhook", {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({
                    event: "game_created",
                    repository: selectedRepo,
                    game_id: gameId.trim(),
                    installation_id: installationId,
                }),
            });

            console.log("✅ GitHub App notified to create workflow.");
            handleClose();
        } catch (err) {
            console.error("❌ Error creating game:", err);
        }
    };

    const handleTeamChange = (e) => {
        const selectedTeamName = e.target.value;
        setSelectedTeam(selectedTeamName);
        const team = teams.find((team) => team.team_name === selectedTeamName);
        setTeamIconUrl(team ? team.team_icon_url : "");
    }

    const handleAuthorizeMoreRepos = () => {
        const githubAppAuthUrl = "https://github.com/apps/diabolical-launcher-integration/installations/select_target";

        window.electronAPI.openExternal(githubAppAuthUrl);
    };

    return (<StyledDialog open={open} onClose={handleClose} aria-labelledby="create-game-dialog-title">
        <DialogContent className={"p-0 overflow-hidden"}>
            <Stack className={"dialog gap-5 p-5"} flexDirection={isMobile ? "column" : "row"} style={{
                backgroundColor: colors.background,
                border: "1px solid" + colors.border,
            }}>
                <Stack alignItems="center" className={"gap-5 justify-between rounded-xs"}>
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
                    <Stack className={"gap-5 w-full"} style={{margin: 0}}>  

                        <Stack className={"gap-5"} direction={"row"}>
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
                                    variant={"filled"}
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

                        {/* Background Image URL Input Field */}
                        <TextField
                            label="Background Image URL"
                            variant="outlined"
                            fullWidth
                            multiline={true}
                            minRows={1}
                            maxRows={3}
                            value={gameBackgroundUrl}
                            onChange={(e) => setGameBackgroundUrl(e.target.value)}
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


                    </Stack>
                </Stack>

                <Stack className={"items-end w-full gap-5 justify-between"}>
                    <Stack className={"gap-5 w-full"}>
                        {/* GitHub Repository Selection */}
                        <Stack className={"gap-3 h-[400px] overflow-auto p-2 rounded-xs"} style={{
                            backgroundColor: "#161616",
                        }}>
                            {loadingRepos ? (<Stack alignItems="center" justifyContent="center">
                                <CircularProgress size={20}/>
                                <p style={{color: colors.text, fontSize: "14px", margin: "8px 0 0"}}>Loading
                                    Repositories...</p>
                            </Stack>) : (githubRepos.map((repo) => (<Stack
                                key={repo.id}
                                direction="row"
                                className={"justify-between items-center p-3 rounded-xs cursor-pointer"}
                                style={{
                                    transition: "background 0.2s",
                                    border: selectedRepo === repo.full_name ? "1px solid #00bcd4" : "transparent",
                                }}
                                onClick={() => setSelectedRepo(repo.full_name)}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                {/* Custom GitHub Icon */}
                                <img
                                    src="MenuIcons/github-mark-white.png"
                                    alt="GitHub"
                                    style={{aspectRatio: "1 / 1", width: "16px"}}
                                />

                                {/* Repository Name */}
                                <p style={{
                                    color: colors.text, margin: 0, fontSize: "14px", flex: 1, paddingLeft: "8px"
                                }}>
                                    {repo.full_name}
                                </p>

                                {/* Repo Visibility (Public/Private) */}
                                <span
                                    style={{
                                        color: repo.private ? "#ff4081" : "#00e676",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                    }}
                                >
                    {repo.private ? "PRIVATE" : "PUBLIC"}
                </span>
                            </Stack>)))}
                        </Stack>

                        {/* Link to authorize more repositories */}
                        <Link component="button" onClick={handleAuthorizeMoreRepos}
                              style={{color: "#00bcd4", textAlign: "center",}}>
                            Can't find your repo? Authorize more repositories.
                        </Link>

                    </Stack>

                    {/* Save Button */}
                    <Button
                        sx={{
                            color: "#fff !important",
                            outline: "1px solid" + colors.border,
                            borderRadius: "4px",
                            justifyContent: "space-between",
                            padding: "12px",
                            width: "fit-content"
                        }}
                        onClick={handleSave}
                        aria-label="save"
                        startIcon={<RocketLaunchIcon/>}
                    >
                        Create and Deploy Game!
                    </Button>
                </Stack>
            </Stack>
        </DialogContent>
    </StyledDialog>);
};

export default CreateGameDialog;
