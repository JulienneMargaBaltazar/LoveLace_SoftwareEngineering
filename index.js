import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/authRoutes.js';
import { supabase } from './src/config/supabaseClient.js';
import { requireAuth } from './src/middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Core Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 2. Session Middleware (MUST be registered BEFORE routes)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// 3. API Routes
app.use('/api/auth', authRoutes);

// 4. Protected Route Example
app.get('/api/dashboard', requireAuth, (req, res) => {
  return res.status(200).json({
    message: 'Welcome to the protected dashboard!',
    userSessionData: {
      userId: req.session.userId,
      email: req.session.email,
      roleId: req.session.roleId
    }
  });
});

// 5. Root Redirect (Ensure this matches your actual filename: signup.html vs signUp.html)
app.get('/', (req, res) => {
  res.redirect('/signup.html');
});

// 6. Database Connection Test & Server Startup
async function testConnection() {
  console.log('🔄 Pinging Supabase database instance...');
  const { data, error } = await supabase.from('app_user').select('*').limit(1);
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