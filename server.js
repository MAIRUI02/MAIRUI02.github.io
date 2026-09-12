import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory status store for edge-functions/api/status fallback
let statusStore = { currentWork: '《待补充作品名》', updatedAt: null };

app.get('/api/status', (req, res) => {
  res.json(statusStore);
});

app.post('/api/status', (req, res) => {
  const currentWork = String(req.body?.currentWork || '').trim();
  if (!currentWork || currentWork.length > 120) {
    return res.status(400).json({ error: '作品名不能为空，且不能超过 120 个字符' });
  }
  statusStore = { currentWork, updatedAt: new Date().toISOString() };
  res.json(statusStore);
});

// Convenience route for works directory
app.get(['/works', '/works/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'works.html'));
});

// Static assets serving with HTML extension support
app.use(express.static(__dirname, {
  extensions: ['html'],
  index: 'index.html'
}));

// Fallback for missing routes to index.html
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
