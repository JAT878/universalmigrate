import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';

// Layout
import Layout from './components/Layout/Layout';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Connectors from './pages/Connectors/Connectors';
import Migrations from './pages/Migrations/Migrations';
import NewMigration from './pages/NewMigration/NewMigration';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/connectors" element={<Connectors />} />
            <Route path="/migrations" element={<Migrations />} />
            <Route path="/migrations/new" element={<NewMigration />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

export default App;
