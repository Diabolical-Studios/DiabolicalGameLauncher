import * as React from "react";
import Skeleton from "@mui/material/Skeleton";

const TeamsSkeleton = () => {
    return (
        <div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>
            {/* Game Cards Grid Skeleton */}
            <div
                id="game-cards-container"
                style={{
                    padding: "12px",
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(250px, 1fr))",
                    gap: "12px",
                }}
            >
                {Array.from({length: 6}).map((_, index) => (
                    <Skeleton
                        key={index}
                        variant="rounded"
                        width="-webkit-fill-available"
                        height="-webkit-fill-available"
                        sx={{bgcolor: "#161616", borderRadius: "2px", aspectRatio: 1}}
                    />
                ))}
            </div>
        </div>
    );
};

export default TeamsSkeleton;
