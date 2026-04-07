const { Pool } = require("pg");
 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false }, // uncomment for hosted DBs like Supabase/Railway
});
 
module.exports = pool;
 