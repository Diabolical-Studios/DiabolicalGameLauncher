import React, { useEffect, useState } from "react";
import "../settings.css";
import ImageButton from "../components/button/ImageButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DownloadIcon from "@mui/icons-material/Download";
import {colors} from "../theme/colors";

const LibraryPage = () => {
    const [installedGameIds, setInstalledGameIds] = useState([]);
    const [cachedGames, setCachedGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [activeDownloads, setActiveDownloads] = useState({}); // { [gameId]: { percentage, speed } }
    const [downloadingGameId, setDownloadingGameId] = useState(null); // Track which game is actively downloading
    const [hasUpdate, setHasUpdate] = useState(false);

    const downloadingGame = activeDownloads[selectedGame?.game_id];
    const isDownloading = !!downloadingGame;
    const buttonLabel = isDownloading ? `Downloading ${downloadingGame.percentageString}` : hasUpdate ? "Update" : "Play";
    const buttonIcon = isDownloading || hasUpdate ? DownloadIcon : PlayArrowIcon;

    // Set up download listeners
    useEffect(() => {
        const handleDownloadProgress = (progressData) => {
            if (!progressData?.gameId) return;

            const percent = Math.round(progressData.percentage * 100);
            setDownloadingGameId(progressData.gameId);

            setActiveDownloads((prev) => {
                const now = Date.now();
                const prevEntry = prev[progressData.gameId] || {};
                const timeDiff = prevEntry.time ? (now - prevEntry.time) / 1000 : null;
                const progressDiff = prevEntry.percent !== undefined ? percent - prevEntry.percent : null;

                let speed = prevEntry.speed || null;

                if (timeDiff && progressDiff > 0) {
                    const totalSizeMB = 500; // placeholder
                    speed = ((totalSizeMB * (progressDiff / 100)) / timeDiff).toFixed(2);
                }

                return {
                    ...prev,
                    [progressData.gameId]: {
                        percent,
                        percentageString: `${percent}%`,
                        speed,
                        time: now,
                    },
                };
            });
        };

        const handleDownloadComplete = ({ gameId }) => {
            // ✅ Remove from activeDownloads
            setActiveDownloads((prev) => {
                const updated = { ...prev };
                delete updated[gameId];
                return updated;
            });

            // ✅ Clear downloadingGameId if the completed one matches
            setDownloadingGameId((prev) => (prev === gameId ? null : prev));

            // ✅ Refresh state if it's the currently selected game
            if (gameId === selectedGame?.game_id) {
                setHasUpdate(false);
                fetchLocalVersion(gameId);
            }
        };

        const handleGameUninstalled = (gameId) => {
            if (gameId === selectedGame?.game_id) {
                setHasUpdate(false);
            }
        };

        window.electronAPI?.onDownloadProgress(handleDownloadProgress);
        window.electronAPI?.onDownloadComplete(handleDownloadComplete);
        window.electronAPI?.onGameUninstalled(handleGameUninstalled);

        return () => {
            // No remove methods currently, but safe cleanup placeholder
        };
    }, [selectedGame]);

    useEffect(() => {
        const loadGames = async () => {
            try {
                const ids = await window.electronAPI.getInstalledGames();
                setInstalledGameIds(ids);

                const metadata = await window.electronAPI.getCachedGames();
                setCachedGames(metadata);

                if (ids.length > 0) {
                    const first = metadata.find(g => g.game_id === ids[0]) || { game_id: ids[0] };
                    setSelectedGame(first);
                    fetchLocalVersion(first.game_id);
                }
            } catch (err) {
                console.error("Error loading library:", err);
            }
        };

        loadGames();
    }, []);

    const fetchLocalVersion = async (gameId) => {
        try {
            const currentVersion = await window.electronAPI.getCurrentGameVersion(gameId);
            const { latestVersion } = await window.electronAPI.getLatestGameVersion(gameId);
            setHasUpdate(currentVersion !== latestVersion);
        } catch (err) {
            console.error("Error fetching local game version:", err);
            setHasUpdate(false);
        }
    };

    const handleSelectGame = async (game) => {
        setSelectedGame(game);
        fetchLocalVersion(game.game_id);
    };

    const installedGameObjects = installedGameIds.map((id) => cachedGames.find((g) => g.game_id === id) || { game_id: id, game_name: id });

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            {/* Left Panel */}
            <div style={{ width: "25%", backgroundColor: "#121212", padding: "12px", overflowY: "auto", borderRight: "1px solid #333" }}>
                <h2>Your Games</h2>
                <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {installedGameObjects.map((game) => (
                        <li
                            key={game.game_id}
                            onClick={() => handleSelectGame(game)}
                            style={{
                                padding: "8px",
                                backgroundColor: selectedGame?.game_id === game.game_id ? "#1f1f1f" : "#000",
                                cursor: "pointer",
                                border: "1px solid #2a2a2a",
                                borderRadius: "2px",
                                color: "white",
                            }}
                        >
                            {game.game_name || game.game_id}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right Panel */}
            <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "100%", backgroundColor: colors.transparent }}>
                <div style={{ flexGrow: 1, overflowY: "auto" }}>
                    {selectedGame ? (
                        <>
                            {/* Banner */}
                            <div
                                style={{
                                    backgroundImage: `url(${selectedGame.background_image_url || ""})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    height: "300px",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    padding: "12px",
                                    borderBottom: "1px solid #222",
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor: "rgba(0,0,0,0.6)",
                                        padding: "12px",
                                        borderRadius: "2px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}
                                >
                                    {selectedGame.team_icon_url && (
                                        <img src={selectedGame.team_icon_url} alt="Team Icon" style={{ width: "32px", height: "32px" }} />
                                    )}
                                    <h1 style={{ margin: 0 }}>{selectedGame.game_name || selectedGame.game_id}</h1>
                                </div>
                            </div>

                            {/* Details */}
                            <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                    <ImageButton
                                        text={buttonLabel}
                                        icon={buttonIcon}
                                        onClick={() => {
                                            if (isDownloading) return;
                                            if (hasUpdate) {
                                                window.electronAPI.downloadGame(selectedGame.game_id);
                                            } else {
                                                window.electronAPI.openGame(selectedGame.game_id);
                                            }
                                        }}
                                        style={{
                                            padding: "12px 24px",
                                            flexDirection: "row-reverse",
                                            justifyContent: "left",
                                        }}
                                    />

                                    <div style={{ color: "#aaa", fontSize: "14px", display: "flex", gap: "32px" }}>
                                        <div style={{ marginBottom: "4px" }}>
                                            <span style={{ fontSize: "12px", color: "#666" }}>LAST PLAYED</span>
                                            <div>Today</div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: "12px", color: "#666" }}>PLAY TIME</span>
                                            <div>10.9 hours</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Game Description Below */}
                                <div style={{ fontSize: "14px", color: "#ddd", width: "40%", padding: "12px", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: colors.transparent, outline: "1px solid", outlineColor: colors.border, borderRadius: "2px"}}>
                                    <h3 style={{fontSize: "18px", color: "#666"}}>Description:</h3>
                                    <p>{selectedGame.description || "No description available"}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: "12px" }}>
                            <p>No game selected</p>
                        </div>
                    )}
                </div>

                {/* Sticky Download Bar */}
                {downloadingGameId && activeDownloads[downloadingGameId] && (
                    <div
                        style={{
                            position: "sticky",
                            bottom: 0,
                            backgroundColor: "#111",
                            padding: "8px 12px",
                            borderTop: "1px solid #222",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            zIndex: 999,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#aaa" }}>
                            <span>{cachedGames.find((g) => g.game_id === downloadingGameId)?.game_name || downloadingGameId}</span>
                            <span>{activeDownloads[downloadingGameId].speed ? `${activeDownloads[downloadingGameId].speed} MB/s` : "..."}</span>
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height: "6px",
                                backgroundColor: "#222",
                                borderRadius: "3px",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    width: `${activeDownloads[downloadingGameId].percent}%`,
                                    height: "100%",
                                    backgroundColor: "#0078d7",
                                    transition: "width 0.2s ease",
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryPage;
