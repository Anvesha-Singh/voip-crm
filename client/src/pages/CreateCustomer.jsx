import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // useSearchParams reads ?phone=...
import { Box, Paper, Typography, TextField, Button, Grid } from '@mui/material';
import api from '../api';

function CreateCustomer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get the phone number passed from the Popup
  const initialPhone = searchParams.get('phone') || '';

  const [formData, setFormData] = useState({
    phone_number: '',
    first_name: '',
    last_name: '', // Optional in DB, but good to have in UI
    email: '',
    address: ''
  });

  // Set the phone number when the page loads
  useEffect(() => {
    if (initialPhone) {
      setFormData(prev => ({ ...prev, phone_number: initialPhone }));
    }
  }, [initialPhone]);

  const handleSubmit = async () => {
    try {
      // Send data to backend
      await api.post('/customers', formData);
      // If successful, redirect to their new profile
      navigate(`/customer/${formData.phone_number}`);
    } catch (err) {
      console.error(err);
      alert('Error: Phone number might already exist or server is down.');
    }
  };

  return (
    <Box display="flex" justifyContent="center" p={4}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 600 }}>
        <Typography variant="h5" gutterBottom>Create New Customer</Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField 
              label="Phone Number" 
              fullWidth 
              value={formData.phone_number}
              // We lock this field so they don't accidentally change the caller ID
              InputProps={{ readOnly: true }} 
              variant="filled"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField 
              label="First Name" fullWidth 
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField 
              label="Last Name" fullWidth 
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              label="Email" fullWidth 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              label="Address" fullWidth multiline rows={3}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" size="large" fullWidth onClick={handleSubmit}>
              Save Customer
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default CreateCustomer;