const { Client } = require("pg")
const fs = require("fs")
const path = require("path")

const password = encodeURIComponent("ci4+y-Qg_+37ceD")
const connectionString = `postgresql://postgres:${password}@db.wldlxtxautsvcjtgqxbg.supabase.co:5432/postgres`

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, "..", "migrations", "001_wallet_escrow.sql"), "utf8")
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    await client.query(sql)
    console.log("Migration applied successfully")
  } catch (err) {
    console.error("Migration failed:", err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
