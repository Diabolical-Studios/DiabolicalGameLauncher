import React from "react";
import Grid from "../Grid";
import TeamCard from "./TeamCard";

const Teams = ({ teams, loading, error }) => {
    if (loading) return <p>Loading teams...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "12px", width: "-webkit-fill-available", height: "fit-content" }}>
            {teams.length === 0 ? (
                <p>You are not in any teams.</p>
            ) : (
                <Grid style={{ listStyle: "none", padding: 0, margin: 0, textAlign: "left", overflow: "hidden" }}>
                    {teams.map((team, index) => (
                        <TeamCard key={index} team={team} />
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default Teams;
