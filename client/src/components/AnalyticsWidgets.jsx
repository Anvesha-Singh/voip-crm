import { useEffect, useState } from 'react';
import { Paper, Typography, Grid, Button, Box, CircularProgress } from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, 
  PieChart, Pie, Cell, Legend, ResponsiveContainer 
} from 'recharts';
import api from '../api';

const COLORS = ['#0088FE', '#00C49F', '#FF8042', '#FFBB28'];

function AnalyticsWidgets() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analytics/dashboard')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    window.open('http://localhost:3000/api/reports/customers', '_blank');
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (!data) return <Typography color="error">Failed to load analytics.</Typography>;

  return (
    <Box mt={4} width="100%">
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={3} gap={2}>
        <Typography variant="h5" fontWeight="bold">Business Overview</Typography>
        <Button variant="outlined" color="success" onClick={handleDownload} fullWidth={false}>
            📥 Export Customer List
        </Button>
      </Box>

      <Grid container spacing={3}>
        
        {/* Chart 1: Daily Orders (Responsive) */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Orders (Last 7 Days)</Typography>
            
            {/* The Box needs flexGrow to fill the Paper height, and width 100% for the Chart */}
            <Box flexGrow={1} width="100%" minHeight={0}>
              {data.daily.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.daily} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#f5f5f5' }} />
                    <Bar dataKey="count" fill="#1976d2" name="Orders" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography color="textSecondary">No orders in the last 7 days.</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Chart 2: Status Distribution (Responsive Pie) */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom align="center">Order Status</Typography>
            
            <Box flexGrow={1} width="100%" minHeight={0}>
              {data.status.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.status}
                      cx="50%"
                      cy="50%"
                      innerRadius={60} // Makes it a Donut chart (more modern)
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                    >
                      {data.status.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                 <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography color="textSecondary">No order data available.</Typography>
                 </Box>
              )}
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}

export default AnalyticsWidgets;