import http from 'node:http';
import { URL } from 'node:url';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'mock-auth-secret';
const PORT = Number(process.env.AUTH_PORT ?? 4010);

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function parseFormBody(body) {
  const params = new URLSearchParams(body);
  return Object.fromEntries(params.entries());
}

function issueToken(role, subject) {
  const expiresIn = 3600;
  const access_token = jwt.sign({ role, sub: subject ?? role }, JWT_SECRET, { expiresIn });
  return { access_token, token_type: 'Bearer', expires_in: expiresIn };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function getBearerRole(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'missing_token', status: 401 };
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === 'object' && payload?.role) {
      return { role: payload.role };
    }
    return { error: 'invalid_token', status: 401 };
  } catch {
    return { error: 'invalid_token', status: 401 };
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/oauth/token') {
    const raw = await readBody(req);
    const form = parseFormBody(raw);
    const grantType = form.grant_type;
    const role = form.role ?? 'admin';

    if (grantType === 'client_credentials') {
      if (form.client_id !== 'test-client' || form.client_secret !== 'test-secret') {
        sendJson(res, 401, { error: 'invalid_client' });
        return;
      }
      sendJson(res, 200, issueToken(role, form.client_id));
      return;
    }

    if (grantType === 'password') {
      sendJson(res, 200, issueToken(role, form.username ?? role));
      return;
    }

    sendJson(res, 400, { error: 'unsupported_grant_type' });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/auth/login') {
    const raw = await readBody(req);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      sendJson(res, 400, { error: 'invalid_json' });
      return;
    }
    const role = body.role ?? 'admin';
    sendJson(res, 200, issueToken(role, body.username ?? role));
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/protected/')) {
    const resource = url.pathname.replace('/protected/', '');
    const auth = getBearerRole(req.headers.authorization);
    if (auth.error) {
      sendJson(res, auth.status, { error: auth.error, message: 'Unauthorized' });
      return;
    }

    if (resource === 'admin') {
      if (auth.role !== 'admin') {
        sendJson(res, 403, { error: 'forbidden', message: 'Admin role required' });
        return;
      }
      sendJson(res, 200, { resource: 'admin', role: auth.role });
      return;
    }

    if (resource === 'viewer') {
      if (auth.role !== 'viewer' && auth.role !== 'admin') {
        sendJson(res, 403, { error: 'forbidden', message: 'Viewer role required' });
        return;
      }
      sendJson(res, 200, { resource: 'viewer', role: auth.role });
      return;
    }

    sendJson(res, 404, { error: 'not_found' });
    return;
  }

  sendJson(res, 404, { error: 'not_found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock auth server listening on http://127.0.0.1:${PORT}`);
});
