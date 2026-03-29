const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function initDB() {
  console.log('📦 Initializing PostgreSQL database...');
  const client = await pool.connect();

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');

    // Due to the way schema.sql might have \c (psql specific meta-commands)
    // we should strip them out because pg module doesn't understand them.
    const cleanSchemaSql = schemaSql.replace(/^\\c .*;$/m, '');
    
    console.log('🔄 Executing schema...');
    await client.query('BEGIN');
    await client.query(cleanSchemaSql);
    await client.query('COMMIT');
    console.log('✅ Schema executed successfully.');

    console.log('🔄 Executing seed data...');
    await client.query('BEGIN');
    await client.query(seedSql);
    await client.query('COMMIT');
    console.log('✅ Seed data executed successfully.');

    console.log('🚀 Database initialization complete!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing database:', error);
  } finally {
    client.release();
    pool.end();
  }
}

initDB();
