import React, {useEffect, useState} from "react";
import {colors} from "../theme/colors";

const ChangelogPage = () => {
    const [releases, setReleases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReleases = async () => {
            try {
                const response = await fetch("https://api.github.com/repos/Diabolical-Studios/DiabolicalGameLauncher/releases");
                if (!response.ok) {
                    throw new Error(`GitHub API Error: ${response.status}`);
                }
                const data = await response.json();
                setReleases(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReleases();
    }, []);

    return (
        <div style={{
            overflowX: 'auto', padding: "12px", overscrollBehavior: "contain",
            scrollSnapType: "x mandatory",
            scrollSnapAlign: "start",
            scrollbarWidth: "thin",
            scrollbarColor: "#1f1e1e transparent",
        }}>
            <h1 style={{margin: 0}}>Change Log</h1>
            {loading && <p>Loading releases...</p>}
            {error && <p style={{color: "red"}}>Error: {error}</p>}
            {!loading && !error && (
                <ul style={{padding: 0, listStyleType: "none", display: "flex", flexDirection: "column", gap: "12px"}}>
                    {releases.map((release) => (
                        <li key={release.id}
                            style={{
                                padding: "12px",
                                gap: "12px",
                                backgroundColor: "rgba(0, 0, 0, 0.6)",
                                border: "1px solid" + colors.border,
                                display: "flex", flexDirection: "row", justifyContent: "space-between",
                            }}>

                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                                width: "-webkit-fill-available",
                            }}><h1 style={{margin: 0}}>{release.name || release.tag_name}</h1>
                                <p style={{fontSize: "14px", color: "#aaa", margin: 0}}>Released
                                    on: {new Date(release.published_at).toLocaleDateString()}</p>
                                <a href={release.html_url} target="_blank" rel="noopener noreferrer"
                                   style={{color: "#0078d7", textDecoration: "underline"}}>
                                    View on GitHub
                                </a></div>

                            <div style={{width: "-webkit-fill-available",}}><p style={{margin: 0}}
                                                                               dangerouslySetInnerHTML={{__html: release.body.replace(/\r\n/g, "<br>")}}></p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ChangelogPage;
