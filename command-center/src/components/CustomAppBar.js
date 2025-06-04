import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';

const CustomAppBar = ({ drawersVisible, onToggleDrawers }) => (
  <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#23243a', color: '#e0e6ed', boxShadow: '0 2px 8px 0 #181a2a' }}>
    <Toolbar>
      <IconButton
        edge="start"
        color="inherit"
        aria-label={drawersVisible ? 'Hide Drawers' : 'Show Drawers'}
        onClick={onToggleDrawers}
        sx={{ mr: 2 }}
      >
        {drawersVisible ? <MenuOpenIcon /> : <MenuIcon />}
      </IconButton>
      <Typography variant="h6" noWrap component="div" sx={{ color: '#e0e6ed' }}>
        Command Center
      </Typography>
    </Toolbar>
  </AppBar>
);

export default CustomAppBar;
