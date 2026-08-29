const http = require('http');
const crypto = require('crypto');

const JWT_SECRET = '6000576da50db77526e8258b4b29353405b3d0936678de321cf5c781b29a6b5eca007840ea28c5caddd1ec155174303d0251ab2000d7b4e9f904d419d569e94a';
function base64UrlEncode(str) { return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'); }
const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const payload = base64UrlEncode(JSON.stringify({ userId: '1053433E-F36B-1410-85ED-009A959FB122', userType: 'INTERNAL', roles: ['ADMINISTRATOR'], permissions: ['USER.VIEW', 'SECURITY.VIEW', 'SECURITY_DASHBOARD.VIEW', 'SECURITY.DASHBOARD.VIEW'], iss: 'OMS', aud: 'OMS_USERS', exp: Math.floor(Date.now() / 1000) + 3600 }));
const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const token = `${header}.${payload}.${signature}`;

http.get('http://localhost:4000/api/v1/internal/security/stream', { headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' } }, (res) => {
  res.on('data', chunk => {
      console.log('--- STREAM CHUNK ---');
      console.log(chunk.toString());
  });
});
