import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/authRoutes.js';
import { supabase } from './src/config/supabaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);

// Test database connection on startup
async function testConnection() {
  console.log('🔄 Pinging Supabase database instance...');
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('❌ Connection failed:', error.message);
  } else {
    console.log('✅ Active connection ping successful!');
    console.log('QueryResult:', data);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  await testConnection();
});