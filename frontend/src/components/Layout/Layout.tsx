import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  Storage as StorageIcon,
  CompareArrows as CompareArrowsIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const navigationItems = [
    { name: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { name: 'Connectors', icon: <StorageIcon />, path: '/connectors' },
    { name: 'Migrations', icon: <CompareArrowsIcon />, path: '/migrations' }
  ];
  
  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          UniversalMigrate
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light + '20',
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light + '30',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.secondary 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.name} 
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.primary,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <PowerSettingsNewIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: 'none',
          backgroundColor: 'white',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            {navigationItems.find(item => location.pathname === item.path)?.name || 'UniversalMigrate'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
