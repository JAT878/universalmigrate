import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';

// Mock data for connectors
const connectorsData = [
  { 
    id: 1, 
    name: 'Production Salesforce', 
    type: 'Salesforce', 
    status: 'Connected',
    lastSync: '2025-04-07T14:30:00Z'
  },
  { 
    id: 2, 
    name: 'SQL Server Data Warehouse', 
    type: 'SQL Server', 
    status: 'Connected',
    lastSync: '2025-04-07T12:15:00Z'
  },
  { 
    id: 3, 
    name: 'MongoDB Atlas Cluster', 
    type: 'MongoDB', 
    status: 'Error',
    lastSync: '2025-04-06T09:45:00Z'
  },
  { 
    id: 4, 
    name: 'Snowflake DW', 
    type: 'Snowflake', 
    status: 'Connected',
    lastSync: '2025-04-07T18:20:00Z'
  },
  { 
    id: 5, 
    name: 'Dev Salesforce', 
    type: 'Salesforce', 
    status: 'Connected',
    lastSync: '2025-04-07T11:00:00Z'
  }
];

// Connector types
const connectorTypes = [
  'Salesforce',
  'SQL Server',
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'Snowflake',
  'BigQuery',
  'Oracle',
  'Cassandra'
];

const Connectors: React.FC = () => {
  const [connectors, setConnectors] = useState(connectorsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editConnector, setEditConnector] = useState<any>(null);

  // Filter connectors based on search term
  const filteredConnectors = connectors.filter(connector => 
    connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connector.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (connector: any = null) => {
    setEditConnector(connector);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditConnector(null);
  };

  const handleSaveConnector = () => {
    // Handle save/update logic
    handleCloseDialog();
  };

  const handleDeleteConnector = (id: number) => {
    // Handle delete logic
    setConnectors(connectors.filter(connector => connector.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">Connectors</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Connector
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search connectors..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Sync</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredConnectors.map((connector) => (
                  <TableRow key={connector.id}>
                    <TableCell>{connector.name}</TableCell>
                    <TableCell>{connector.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={connector.status}
                        color={connector.status === 'Connected' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(connector.lastSync)}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenDialog(connector)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteConnector(connector.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Connector Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editConnector ? 'Edit Connector' : 'New Connector'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Connector Name"
                fullWidth
                defaultValue={editConnector?.name || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Connector Type</InputLabel>
                <Select
                  defaultValue={editConnector?.type || ''}
                  label="Connector Type"
                >
                  {connectorTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Host / URL"
                fullWidth
                defaultValue=""
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Username"
                fullWidth
                defaultValue=""
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Password"
                type="password"
                fullWidth
                defaultValue=""
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Additional Configuration (JSON)"
                fullWidth
                multiline
                rows={4}
                defaultValue=""
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveConnector} variant="contained" color="primary">
            {editConnector ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Connectors;
