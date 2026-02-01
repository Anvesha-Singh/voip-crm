import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const socket = io.connect(SOCKET_URL);

function CallPopup() {
  const [open, setOpen] = useState(false);
  const [callData, setCallData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the event from the server
    socket.on("call_incoming", (data) => {
      console.log("Call received!", data);
      setCallData(data);
      setOpen(true);
    });

    // Cleanup listener when app closes
    return () => socket.off("call_incoming");
  }, []);

  const handleClose = () => {
    setOpen(false);
    setCallData(null);
  };

  const handleAction = () => {
    if (callData.found) {
        // Known Customer -> Go to Profile
        navigate(`/customer/${callData.caller_number}`);
    } else {
        // Unknown Caller -> Go to Create Page with phone number in URL
        navigate(`/customers/new?phone=${callData.caller_number}`);
    }
    handleClose();
  };

  if (!callData) return null;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      {/* Header changes color based on Known/Unknown */}
      <DialogTitle sx={{ bgcolor: callData.found ? '#e8f5e9' : '#ffebee' }}>
        {callData.found ? '📞 Incoming Customer Call' : '📞 Unknown Caller'}
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
            {callData.caller_number}
        </Typography>
        
        {callData.found ? (
            <Box>
                <Typography variant="h6" color="primary">
                    {callData.customer.first_name} {callData.customer.last_name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {callData.customer.email}
                </Typography>
            </Box>
        ) : (
            <Typography color="error">
                No customer record found.
            </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button onClick={handleClose} color="inherit">Ignore</Button>
        <Button 
            variant="contained" 
            color={callData.found ? "primary" : "secondary"}
            onClick={handleAction}
            size="large"
        >
            {callData.found ? "Open Profile" : "Create Customer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CallPopup;