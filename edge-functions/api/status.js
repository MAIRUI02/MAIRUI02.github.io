const fallback = { currentWork: '《待补充作品名》', updatedAt: null };
const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});

function getKv(env) {
  return env.ARCHIVE_STATUS || globalThis.ARCHIVE_STATUS;
}

export async function onRequestGet({ env }) {
  const kv = getKv(env);
  if (!kv) return json(fallback);
  const saved = await kv.get('current_status', { type: 'json' });
  return json(saved || fallback);
}

export async function onRequestPost({ request, env }) {
  const expected = env.ARCHIVE_ADMIN_PASSWORD;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!expected || !supplied || supplied !== expected) return json({ error: '未授权' }, 401);

  const kv = getKv(env);
  if (!kv) return json({ error: '尚未绑定 ARCHIVE_STATUS KV 命名空间' }, 503);

  let body;
  try { body = await request.json(); } catch { return json({ error: '请输入有效内容' }, 400); }
  const currentWork = String(body.currentWork || '').trim();
  if (!currentWork || currentWork.length > 120) return json({ error: '作品名不能为空，且不能超过 120 个字符' }, 400);

  const value = { currentWork, updatedAt: new Date().toISOString() };
  await kv.put('current_status', JSON.stringify(value));
  return json(value);
}
