import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

function Login() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // In a real app, we would check password with server here.
    // For MVP, we just save the user and go to dashboard.
    localStorage.setItem('user', username);
    navigate('/dashboard');
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, width: 300, textAlign: 'center' }}>
        <Typography variant="h5" mb={3}>VoIP CRM Login</Typography>
        <TextField 
          label="Username" 
          fullWidth 
          margin="normal" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button 
          variant="contained" 
          fullWidth 
          sx={{ mt: 2 }} 
          onClick={handleLogin}
        >
          Sign In
        </Button>
      </Paper>
    </Box>
  );
}

export default Login;