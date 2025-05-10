import React from 'react';
import { Stack } from '@mui/material';

const HorizontalFlex = ({ children }) => {
  return (
    <Stack direction={'row'} className={'justify-between'}>
      {children}
    </Stack>
  );
};

export default HorizontalFlex;
