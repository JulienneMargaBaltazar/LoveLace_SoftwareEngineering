import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/authRoutes.js';
import { supabase } from './src/config/supabaseClient.js';
import { requireAuth } from './src/middleware/authMiddleware.js';
import adminRoutes from './src/routes/adminRoutes.js';
import { requireAnyRight } from './src/middleware/requireRight.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// 1. Core Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Session Middleware (MUST be registered BEFORE routes)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // <-- MUST be false on HTTP localhost so the browser accepts the cookie!
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// Protect the reports page before falling through to static file handling.
app.get('/user-reports.html', requireAnyRight('reports'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user-reports.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/reports', requireAnyRight('reports'));
app.use('/api/admin', adminRoutes);

// 4. Protected Route Example
app.get('/api/dashboard', requireAuth, (req, res) => {
  supabase
    .from('user_rights')
    .select('module_name, action_key, is_allowed')
    .eq('user_id', String(req.session.userId))
    .eq('is_deleted', false)
    .eq('is_allowed', true)
    .then(({ data: rights, error }) => {
      if (error) {
        console.error('Dashboard rights error:', error.message);
        return res.status(500).json({ error: 'Unable to load user rights.' });
      }

      return res.status(200).json({
        message: 'Welcome to the protected dashboard!',
        userSessionData: {
          userId: req.session.userId,
          email: req.session.email,
          roleId: req.session.roleId,
          firstName: req.session.firstName,
          lastName: req.session.lastName
        },
        rights: rights || []
      });
    })
    .catch(error => {
      console.error('Dashboard rights error:', error);
      return res.status(500).json({ error: 'Unable to load user rights.' });
    });
});

// 5. Root Redirect (Ensure this matches your actual filename: signup.html vs signUp.html)
app.get('/', (req, res) => {
  res.redirect('/landingpage.html');
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