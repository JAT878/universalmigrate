import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  Paper,
} from '@mui/material';
import { 
  Storage as StorageIcon,
  CompareArrows as CompareArrowsIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  // Mock data for dashboard
  const stats = [
    { title: 'Total Connectors', value: 12, icon: <StorageIcon sx={{ fontSize: 40 }} color="primary" /> },
    { title: 'Active Migrations', value: 5, icon: <CompareArrowsIcon sx={{ fontSize: 40 }} color="info" /> },
    { title: 'Completed', value: 28, icon: <CheckIcon sx={{ fontSize: 40 }} color="success" /> },
    { title: 'Issues', value: 2, icon: <WarningIcon sx={{ fontSize: 40 }} color="warning" /> },
  ];

  const recentMigrations = [
    { id: 1, name: 'Salesforce to SQL Server', status: 'In Progress', progress: 65 },
    { id: 2, name: 'MongoDB to PostgreSQL', status: 'Completed', progress: 100 },
    { id: 3, name: 'Oracle to Snowflake', status: 'Scheduled', progress: 0 },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">Dashboard</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/migrations/new"
          startIcon={<AssignmentIcon />}
        >
          New Migration
        </Button>
      </Box>

      {/* Stats cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Box mr={2}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent migrations */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Recent Migrations"
          action={
            <Button component={Link} to="/migrations">
              View all
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            {recentMigrations.map((migration) => (
              <Grid item xs={12} key={migration.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {migration.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {migration.status}
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    to={`/migrations/${migration.id}`}
                    size="small"
                    variant="outlined"
                  >
                    Details
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                component={Link}
                to="/connectors/new"
                variant="outlined"
                fullWidth
                sx={{ py: 2 }}
              >
                Create Connector
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                component={Link}
                to="/migrations/new"
                variant="outlined"
                fullWidth
                sx={{ py: 2 }}
              >
                Start Migration
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                component={Link}
                to="/templates"
                variant="outlined"
                fullWidth
                sx={{ py: 2 }}
              >
                Use Template
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
