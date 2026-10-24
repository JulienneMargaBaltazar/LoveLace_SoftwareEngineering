import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: SUPABASE_URL or SUPABASE_ANON_KEY is missing in your .env file.');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);