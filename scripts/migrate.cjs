const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config();

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is missing in .env.local or .env');
    process.exit(1);
  }

  const databaseUrl = new URL(connectionString);
  const clientConfig = { connectionString };

  try {
    await dns.lookup(databaseUrl.hostname);
  } catch (error) {
    if (error.code !== 'ENOTFOUND') throw error;

    const [ipv6Address] = await dns.resolve6(databaseUrl.hostname);
    clientConfig.host = ipv6Address;
    clientConfig.port = databaseUrl.port ? Number(databaseUrl.port) : 5432;
    clientConfig.database = databaseUrl.pathname.slice(1);
    clientConfig.user = decodeURIComponent(databaseUrl.username);
    clientConfig.password = decodeURIComponent(databaseUrl.password);
    delete clientConfig.connectionString;
    clientConfig.ssl = {
      rejectUnauthorized: false,
      servername: databaseUrl.hostname
    };
    console.log(`ℹ️ Using IPv6 address for ${databaseUrl.hostname}.`);
  }

  const client = new Client(clientConfig);

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL database.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found.');
      return;
    }

    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const checkRes = await client.query('SELECT 1 FROM _schema_migrations WHERE version = $1', [file]);
      if (checkRes.rowCount === 0) {
        console.log(`➡️ Running migration: ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await client.query(sql);
        await client.query('INSERT INTO _schema_migrations (version) VALUES ($1)', [file]);
        console.log(`✅ Applied: ${file}`);
      } else {
        console.log(`⏩ Skipping (already ran): ${file}`);
      }
    }

    console.log('🎉 Database migrations finished successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
