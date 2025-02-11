import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import {Stack} from "@mui/material";

const InfiniteGameSkeleton = () => {
    return (
        <Stack sx={{
            width: '-webkit-fill-available',
            height: '-webkit-fill-available',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            margin: 0,
        }}>
            <Skeleton
                width="100%"
                height="-webkit-fill-available"
                sx={{bgcolor: "#161616"}}
            />
            <Skeleton
                width="100%"
                height="-webkit-fill-available"
                sx={{bgcolor: "#161616"}}
            />
            <Skeleton
                width="100%"
                height="-webkit-fill-available"
                sx={{bgcolor: "#161616"}}
            />
        </Stack>
    );
};

export default InfiniteGameSkeleton;
