import StoreIcon from '@mui/icons-material/Store';

const Navigation = () => {
  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: colors.background,
            borderRight: `1px solid ${colors.border}`,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button component={Link} to="/store" selected={location.pathname === '/store'}>
              <ListItemIcon>
                <StoreIcon sx={{ color: colors.text }} />
              </ListItemIcon>
              <ListItemText primary="Store" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/library"
              selected={location.pathname === '/library'}
            >
              <ListItemIcon>
                <SportsEsportsIcon sx={{ color: colors.text }} />
              </ListItemIcon>
              <ListItemText primary="Library" />
            </ListItem>
            {/* ... rest of the navigation items ... */}
          </List>
        </Box>
      </Drawer>
      {/* ... rest of the component ... */}
    </Box>
  );
};

export default Navigation;
