import express from 'express';
import { readEditableWork, editExistingWork, readTagLibrary, saveTag } from './studio-editor-service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  verifyPasscode,
  changePasscode,
  createSessionToken,
  checkSessionToken,
  readWorksArray,
  getNextWorkId,
  createNewWork,
  updateExistingWork,
  deleteExistingWork
} from './admin-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

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

// Endpoint to directly save custom hero photo to assets/tied-hands-ribbon.jpg
app.post('/api/upload-hero-image', (req, res) => {
  try {
    const dataUrl = req.body?.image;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Missing image data' });
    }
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(dataUrl, 'base64');
    const targetPath = path.join(__dirname, 'assets', 'celebrity-hero-photo.jpg');
    fs.writeFileSync(targetPath, buffer);
    try {
      fs.writeFileSync(path.join(__dirname, 'assets', 'tied-hands-ribbon.jpg'), buffer);
    } catch (_) {}
    return res.json({ success: true, path: '/assets/celebrity-hero-photo.jpg?t=' + Date.now() });
  } catch (err) {
    console.error('Failed to save hero image:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 馆主专属工作台 (Studio / Admin) API
// ----------------------------------------------------------------------------

// 身份校验中间件
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!checkSessionToken(token)) {
    return res.status(401).json({ error: '请先完成馆主口令验证' });
  }
  next();
}

// 1. 口令登录
app.post('/api/admin/login', (req, res) => {
  const passcode = req.body?.passcode;
  if (!passcode || !verifyPasscode(passcode)) {
    return res.status(401).json({ success: false, error: '馆主口令不正确' });
  }
  const token = createSessionToken();
  return res.json({ success: true, token });
});

// 2. 检查会话有效性
app.get('/api/admin/check-auth', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return res.json({ authenticated: checkSessionToken(token) });
});

// 3. 修改口令
app.post('/api/admin/change-passcode', requireAdminAuth, (req, res) => {
  const { oldPasscode, newPasscode } = req.body || {};
  const result = changePasscode(oldPasscode, newPasscode);
  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json(result);
});

// 4. 获取作品列表与下一个 ID
app.get('/api/admin/works', (req, res) => {
  const works = readWorksArray();
  return res.json({ works, total: works.length, nextId: getNextWorkId() });
});

app.get('/api/admin/next-id', (req, res) => {
  return res.json({ nextId: getNextWorkId() });
});

// 5. 录入新作品（全站自动同步生效）
app.get('/api/admin/tags', requireAdminAuth, (req, res) => {
  try { res.json({ tags: readTagLibrary() }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/admin/tags', requireAdminAuth, (req, res) => {
  try { res.json({ tags: saveTag(req.body?.tag) }); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/admin/works', requireAdminAuth, (req, res) => {
  try {
    const result = createNewWork(req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error('Error creating work:', err);
    return res.status(500).json({ error: err.message || '入库失败' });
  }
});

// 6. 更新已有作品
app.get('/api/admin/works/:id', requireAdminAuth, (req, res) => {
  try {
    const work = readEditableWork(req.params.id);
    return work ? res.json({ success: true, work }) : res.status(404).json({ error: '未找到作品' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/works/:id', requireAdminAuth, (req, res) => {
  try {
    const result = editExistingWork(req.params.id, req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error('Error updating work:', err);
    return res.status(500).json({ error: err.message || '更新失败' });
  }
});

app.delete('/api/admin/works/:id', requireAdminAuth, (req, res) => {
  try {
    const result = deleteExistingWork(req.params.id);
    if (!result.success) return res.status(404).json(result);
    return res.json(result);
  } catch (err) {
    console.error('Error deleting work:', err);
    return res.status(500).json({ error: err.message || '删除失败' });
  }
});

// 馆主专属工作台直达路由
app.get(['/studio', '/admin'], (req, res) => {
  res.sendFile(path.join(__dirname, 'studio.html'));
});

// Convenience route for works directory
app.get(['/works', '/works/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'works.html'));
});

// Keep local credentials out of static responses.
app.get('/admin-config.json', (req, res) => res.sendStatus(404));

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

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Studio: http://127.0.0.1:${PORT}/studio.html`);
});
