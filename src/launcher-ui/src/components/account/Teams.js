import React from "react";
import {Stack, Zoom} from "@mui/material";
import Grid from "../Grid";
import TeamCard from "./TeamCard";
import TeamsSkeleton from "../skeleton/TeamsSkeleton";

const Teams = ({teams, loading, error, onUpdateTeam}) => {
    if (loading) return <TeamsSkeleton/>;
    if (error) return <p style={{color: "red"}}>{error}</p>;

    return (<Stack className={"justify-center gap-3 size-full overflow-auto"}>
        {teams.length === 0 ? (<p>You are not in any teams.</p>) : (
            <Grid className={"p-3 m-0 text-left overflow-auto "} style={{
                listStyle: "none", gridTemplateColumns: "repeat(3, minmax(250px, 1fr))"
            }}>
                {teams.map((team, index) => (<Zoom
                    key={team.team_id}
                    direction="up"
                    in={!loading}
                    timeout={300 + index * 100}
                >
                    <div>
                        <TeamCard team={team} onUpdateTeam={onUpdateTeam}/>
                    </div>
                </Zoom>))}
            </Grid>)}
    </Stack>);
};

export default Teams;
