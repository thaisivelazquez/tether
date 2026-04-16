
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false }, // uncomment for hosted DBs like Supabase/Railway
});
 
module.exports = pool;
 
// $ip = "172.19.8.233"
// Get-ChildItem -Recurse -Path src/ -Include *.ts,*.tsx | ForEach-Object {
//   (Get-Content $_.FullName) -replace 'http://localhost:3000', "http://$ip:3000" | Set-Content $_.FullName
// }