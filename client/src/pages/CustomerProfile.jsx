import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  MenuItem
} from '@mui/material';
import api from '../api';

function CustomerProfile() {
  const { phone } = useParams(); // Get phone from URL
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ products: '', total_amount: '', status: 'pending' });

  // 1. Fetch Data on Load
  const fetchData = async () => {
    try {
      const custRes = await api.get(`/customers/${phone}`);
      const ordRes = await api.get(`/customers/${phone}/orders`);
      setCustomer(custRes.data);
      setOrders(ordRes.data);
    } catch (err) {
      console.error(err);
      alert("Customer not found!");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [phone]);

  // 2. Handle New Order Submit
  const handleCreateOrder = async () => {
    try {
      await api.post('/orders', {
        customer_phone: phone,
        ...newOrder
      });
      setOpenOrderModal(false);
      fetchData(); // Refresh the list
    } catch (err) {
      alert("Error creating order");
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box p={4}>
      <Button onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>&larr; Back to Dashboard</Button>
      
      <Grid container spacing={3}>
        {/* Left Col: Customer Details */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>👤 {customer.first_name} {customer.last_name}</Typography>
            <Typography variant="body1"><strong>Phone:</strong> {customer.phone_number}</Typography>
            <Typography variant="body1"><strong>Email:</strong> {customer.email}</Typography>
            <Typography variant="body1"><strong>Address:</strong> {customer.address || 'N/A'}</Typography>
            <Box mt={2}>
                <Button variant="outlined" fullWidth disabled>Edit Details (Coming Soon)</Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Col: Order History */}
        <Grid item xs={12} md={8}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Order History</Typography>
                <Button variant="contained" onClick={() => setOpenOrderModal(true)}>+ New Order</Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Products</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.products}</TableCell>
                      <TableCell>${order.total_amount}</TableCell>
                      <TableCell>
                        <Chip label={order.status} color={order.status === 'pending' ? 'warning' : 'success'} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && <TableRow><TableCell colSpan={4} align="center">No orders yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
        </Grid>
      </Grid>

      {/* New Order Modal */}
      <Dialog open={openOrderModal} onClose={() => setOpenOrderModal(false)}>
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
            <TextField 
                label="Products (e.g. Laptop)" fullWidth margin="normal" 
                onChange={(e) => setNewOrder({...newOrder, products: e.target.value})}
            />
            <TextField 
                label="Total Amount" type="number" fullWidth margin="normal" 
                onChange={(e) => setNewOrder({...newOrder, total_amount: e.target.value})}
            />
            <TextField 
                select label="Status" fullWidth margin="normal" value={newOrder.status}
                onChange={(e) => setNewOrder({...newOrder, status: e.target.value})}
            >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenOrderModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateOrder}>Submit Order</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CustomerProfile;