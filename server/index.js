const express = require('express');
const cors = require('cors');
const pool = require('./db');
// NEW: Import HTTP and Socket.io
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// NEW: Create the HTTP server and wrap Express inside it
const server = http.createServer(app);

// NEW: Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [ "http://localhost:5173",
    "http://localhost:3000",
    "https://viscid-laurice-vitalistically.ngrok-free.dev"
   ], 
    methods: ["GET", "POST"]
  }
});

// --- ROUTES ---

// 1. Create Customer
app.post('/customers', async (req, res) => {
  try {
    const { phone_number, first_name, email } = req.body;
    const newCustomer = await pool.query(
      'INSERT INTO customers (phone_number, first_name, email) VALUES($1, $2, $3) RETURNING *',
      [phone_number, first_name, email]
    );
    res.json(newCustomer.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. Get Customer
app.get('/customers/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const customer = await pool.query('SELECT * FROM customers WHERE phone_number = $1', [phone]);
    if (customer.rows.length === 0) return res.status(404).json({ message: "Customer not found" });
    res.json(customer.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// NEW: 3. The VoIP Webhook (The "Trigger")
app.post('/api/webhook/call', async (req, res) => {
  const { caller_number } = req.body;
  
  console.log(`📞 Incoming call detected from: ${caller_number}`);

  try {
    // A. Search for the customer in the DB
    const result = await pool.query(
      'SELECT * FROM customers WHERE phone_number = $1', 
      [caller_number]
    );

    const customerData = result.rows.length > 0 ? result.rows[0] : null;

    // B. Emit the event to all connected browsers (The "Broadcast")
    // We send an object containing the Number and whether we found them.
    io.emit('call_incoming', {
      caller_number,
      found: !!customerData, // Converts result to true/false
      customer: customerData
    });

    console.log(`📡 Broadcast sent for ${caller_number}. Found in DB: ${!!customerData}`);
    
    res.status(200).send('Webhook received');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- NEW ORDER ROUTES ---

// 3. Create a New Order
app.post('/orders', async (req, res) => {
  try {
    const { customer_phone, products, total_amount, status } = req.body;
    const newOrder = await pool.query(
      'INSERT INTO orders (customer_phone, products, total_amount, status) VALUES($1, $2, $3, $4) RETURNING *',
      [customer_phone, products, total_amount, status]
    );
    res.json(newOrder.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. Get All Orders for a Specific Customer
app.get('/customers/:phone/orders', async (req, res) => {
  try {
    const { phone } = req.params;
    const orders = await pool.query(
      'SELECT * FROM orders WHERE customer_phone = $1 ORDER BY created_at DESC',
      [phone]
    );
    res.json(orders.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- ANALYTICS ROUTES ---

const { Parser } = require('json2csv'); // Import CSV parser

// 1. Dashboard Metrics (Graphs)
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    // A. Daily Order Volume (Last 7 Days)
    const dailyVolume = await pool.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, COUNT(*) as count, SUM(total_amount) as revenue
      FROM orders
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY date
      ORDER BY date ASC
    `);

    // B. Order Status Distribution
    const statusDist = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `);

    res.json({
      daily: dailyVolume.rows,
      status: statusDist.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// 2. Export Customers to CSV
app.get('/api/reports/customers', async (req, res) => {
  try {
    const query = 'SELECT * FROM customers';
    const result = await pool.query(query);
    const customers = result.rows;

    // Convert JSON to CSV
    const fields = ['phone_number', 'first_name', 'last_name', 'email', 'address', 'created_at'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(customers);

    // Send file to browser
    res.header('Content-Type', 'text/csv');
    res.attachment('customers_report.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// --- SERVE STATIC FRONTEND (PRODUCTION ONLY) ---

// 1. Serve static files from the "dist" folder in client
app.use(express.static(path.join(__dirname, '../client/dist')));

// 2. Handle React Routing (Catch-all)
// If a request doesn't match an API route, send back the React index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});