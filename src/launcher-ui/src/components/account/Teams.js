import React from "react";
import {Zoom} from "@mui/material"; // Import MUI Slide animation
import Grid from "../Grid";
import TeamCard from "./TeamCard";
import TeamsSkeleton from "../skeleton/TeamsSkeleton";

const Teams = ({ teams, loading, error, onUpdateTeam }) => {
    if (loading) return <TeamsSkeleton />;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "12px", width: "-webkit-fill-available", height: "fit-content" }}>
            {teams.length === 0 ? (
                <p>You are not in any teams.</p>
            ) : (
                <Grid style={{ listStyle: "none", padding: "12px", margin: 0, textAlign: "left", overflow: "hidden" }}>
                    {teams.map((team, index) => (
                        <Zoom
                            key={team.team_id}
                            direction="up"
                            in={!loading}
                            timeout={300 + index * 100} // Staggered animation
                        >
                            <div>
                                <TeamCard team={team} onUpdateTeam={onUpdateTeam} />
                            </div>
                        </Zoom>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default Teams;
