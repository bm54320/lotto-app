// Simple test server without Auth0 for local testing
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Mock authentication middleware
app.use((req, res, next) => {
  req.oidc = {
    isAuthenticated: () => false,
    user: null
  };
  next();
});

// Static routes for testing
app.get('/', (req, res) => {
  res.render('index', {
    user: null,
    isAuthenticated: false,
    ticketCount: 0,
    drawnNumbers: null,
    isActive: false
  });
});

app.get('/pay', (req, res) => {
  res.render('pay', {
    user: null,
    isAuthenticated: false
  });
});

app.get('/ticket/:code', (req, res) => {
  res.render('ticket', {
    ticket: {
      code: req.params.code,
      documentId: 'TEST123',
      numbers: [1, 2, 3, 4, 5, 6],
      round: {
        drawnNumbers: [7, 8, 9, 10, 11, 12]
      }
    }
  });
});

// Mock API endpoints
app.post('/tickets', (req, res) => {
  res.status(401).send('Authentication required');
});

app.post('/new-round', (req, res) => {
  res.status(401).send('M2M authentication required');
});

app.post('/close', (req, res) => {
  res.status(401).send('M2M authentication required');
});

app.post('/store-results', (req, res) => {
  res.status(401).send('M2M authentication required');
});

const port = 3000;
app.listen(port, () => {
  console.log(`🧪 Test server running on http://localhost:${port}`);
  console.log('📝 This is a simplified version for testing UI without Auth0');
  console.log('🔗 Available routes:');
  console.log('   - http://localhost:3000 (home page)');
  console.log('   - http://localhost:3000/pay (ticket form)');
  console.log('   - http://localhost:3000/ticket/test123 (sample ticket)');
});
