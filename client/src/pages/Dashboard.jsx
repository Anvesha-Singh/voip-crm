import { Box, Typography, Button, AppBar, Toolbar, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AnalyticsWidgets from '../components/AnalyticsWidgets';

function Dashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') || 'Operator';
  const [searchPhone, setSearchPhone] = useState(''); // New State

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSearch = () => {
    if(searchPhone) {
        navigate(`/customer/${searchPhone}`);
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>VoIP CRM</Typography>
          <Typography mr={2}>Hello, {user}</Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Box p={4} maxWidth="600px" mx="auto" textAlign="center">
        <Typography variant="h4" mb={4}>Operator Dashboard</Typography>
        
        {/* Search Box */}
        <Box display="flex" gap={2} mb={4}>
            <TextField 
                label="Search by Phone Number" 
                variant="outlined" 
                fullWidth 
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
            />
            <Button variant="contained" size="large" onClick={handleSearch}>
                Go
            </Button>
        </Box>

        <Typography variant="body2" color="textSecondary">
            Try searching for <strong>555-0199</strong> (Alice)
        </Typography>
        <hr style={{ margin: '40px 0', opacity: 0.5 }} />
        <AnalyticsWidgets />
      </Box>
    </Box>
  );
}
export default Dashboard;