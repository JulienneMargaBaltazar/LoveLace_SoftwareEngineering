import { supabase } from './src/config/supabaseClient.js';

async function verifyDatabaseConnection() {
  console.log('🔄 Pinging Supabase database instance...');

  try {
    const { data, error } = await supabase
      .from('customer_active')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log('✅ Active connection ping successful!');
    console.log('QueryResult:', data);
  } catch (err) {
    console.error('❌ Database connection ping failed:', err.message);
    process.exit(1);
  }
}
verifyDatabaseConnection();