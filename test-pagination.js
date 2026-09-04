const https = require('https');
const crypto = require('crypto');

const JWT_SECRET = '6000576da50db77526e8258b4b29353405b3d0936678de321cf5c781b29a6b5eca007840ea28c5caddd1ec155174303d0251ab2000d7b4e9f904d419d569e94a';
function base64UrlEncode(str) { return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'); }
const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const payload = base64UrlEncode(JSON.stringify({ userId: '1053433E-F36B-1410-85ED-009A959FB122', userType: 'INTERNAL', roles: ['ADMINISTRATOR'], permissions: ['ORG.VIEW'], iss: 'OMS', aud: 'OMS_USERS', exp: Math.floor(Date.now() / 1000) + 3600 }));
const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const token = `${header}.${payload}.${signature}`;

function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`URL: ${url}\nStatus: ${res.statusCode}\nResponse: ${data}\n`);
        resolve();
      });
    });
  });
}

(async () => {
  await testUrl('https://oms-api.alasasit.com/api/v1/organization/units?page=1&pageSize=100&isActive=true');
  await testUrl('https://oms-api.alasasit.com/api/v1/organization/units?page=2&pageSize=100&isActive=true');
  await testUrl('https://oms-api.alasasit.com/api/v1/organization/units?skip=0&take=100');
  await testUrl('https://oms-api.alasasit.com/api/v1/organization/units?pageSize=100');
  await testUrl('https://oms-api.alasasit.com/api/v1/organization/units?offset=0&limit=100');
  await testUrl('https://oms-api.alasasit.com/api/v1/organization/units');
})();
