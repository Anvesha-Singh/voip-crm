const Pool = require('pg').Pool;
require('dotenv').config();

const pool = new Pool({
    // If DATABASE_URL is set (on Render), use it. Otherwise use local vars.
    connectionString: process.env.DATABASE_URL 
        ? process.env.DATABASE_URL 
        : `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    
    // SSL is REQUIRED for Supabase (and most cloud DBs)
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

module.exports = pool;