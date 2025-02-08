import * as React from "react";
import Skeleton from "@mui/material/Skeleton";
import { Stack } from "@mui/material";

const GameCardsSkeleton = ({ topBar = true, columns = 3 }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Top Bar with Chips and Search (Only Rendered if topBar is true) */}
            {topBar && (
                <>
                    <Stack
                        className={"dialog"}
                        style={{
                            width: "-webkit-fill-available",
                            display: "flex",
                            flexDirection: "row",
                            backgroundColor: "transparent",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px",
                        }}
                    >
                        {/* Skeleton Chips */}
                        <Stack sx={{ display: "flex", flexDirection: "row", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    variant="rounded"
                                    width={100}
                                    height={32}
                                    sx={{ bgcolor: "#161616", borderRadius: "2px" }}
                                />
                            ))}
                        </Stack>

                        {/* Skeleton Search Bar */}
                        <Skeleton
                            variant="rounded"
                            width="50%"
                            height={40}
                            sx={{ bgcolor: "#161616", borderRadius: "2px", padding: "8px" }}
                        />
                    </Stack>

                    {/* Divider Skeleton */}
                    <Skeleton variant="rectangular" width="100%" height={2} sx={{ bgcolor: "#222" }} />
                </>
            )}

            {/* Game Cards Grid Skeleton */}
            <div
                id="game-cards-container"
                style={{
                    padding: "12px",
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateColumns: `repeat(${columns}, minmax(250px, 1fr))`, // Manual column setting
                    gap: "12px",
                }}
            >
                {Array.from({ length: columns * 2 }).map((_, index) => ( // Generate cards dynamically
                    <Skeleton
                        key={index}
                        variant="rounded"
                        width="-webkit-fill-available"
                        height="350px"
                        sx={{ bgcolor: "#161616", borderRadius: "2px" }}
                    />
                ))}
            </div>
        </div>
    );
};

export default GameCardsSkeleton;
