const http = require('http');
const crypto = require('crypto');

const JWT_SECRET =
  '6000576da50db77526e8258b4b29353405b3d0936678de321cf5c781b29a6b5eca007840ea28c5caddd1ec155174303d0251ab2000d7b4e9f904d419d569e94a';

const ADMIN_USER_ID = '1053433E-F36B-1410-85ED-009A959FB122';

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createJwt(userId) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    userId,
    userType: 'INTERNAL',
    roles: ['ADMINISTRATOR'],
    permissions: [
      'ORG.VIEW',
      'ORG.CREATE',
      'ORG.UPDATE',
      'ORG.MOVE',
      'ORG.DELETE',
      'ORG.EXPORT',
      'ORG.MANAGER.ASSIGN',
      'ORG.TYPE.MANAGE',
    ],
    scopes: [],
    iss: 'OMS',
    aud: 'OMS_USERS',
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function callNextBff(path, token, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: `/api${path}`,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `oms_access_token=${token}`,
          'X-User-Id': ADMIN_USER_ID,
          'Content-Type': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch {
            json = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: json,
          });
        });
      },
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  const token = createJwt(ADMIN_USER_ID);
  console.log('================================================================');
  console.log('  DOMAIN 2: FRONTEND DATA LAYER E2E BFF PROXY TEST SUITE');
  console.log('  Testing Next.js BFF (localhost:3000) -> NestJS (localhost:4000)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`  ✓ [PASS] ${name} ${extra ? `(${extra})` : ''}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${name} ${extra ? `(${extra})` : ''}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Queries
  // ---------------------------------------------------------------------------
  const typesRes = await callNextBff('/organization/unit-types', token);
  assert(
    'GET /api/organization/unit-types',
    typesRes.status === 200 && Array.isArray(typesRes.data) && typesRes.data.length >= 4,
    `Found ${typesRes.data?.length} types`,
  );

  const allowedParentsRes = await callNextBff('/organization/unit-types/3/allowed-parents', token);
  assert(
    'GET /api/organization/unit-types/3/allowed-parents',
    allowedParentsRes.status === 200 && Array.isArray(allowedParentsRes.data),
    `Allowed parents count: ${allowedParentsRes.data?.length}`,
  );

  const unitsRes = await callNextBff('/organization/units?page=1&pageSize=10', token);
  assert(
    'GET /api/organization/units',
    unitsRes.status === 200 && unitsRes.data && Array.isArray(unitsRes.data.data),
    `Total units: ${unitsRes.data?.total}, Page size: ${unitsRes.data?.data?.length}`,
  );

  const sampleUnit = unitsRes.data?.data?.[0];
  const sampleUnitId = sampleUnit?.orgUnitId;

  const treeRes = await callNextBff('/organization/units/tree', token);
  assert(
    'GET /api/organization/units/tree',
    treeRes.status === 200 && Array.isArray(treeRes.data) && treeRes.data.length > 0,
    `Root nodes: ${treeRes.data?.length}`,
  );

  if (sampleUnitId) {
    const detailRes = await callNextBff(`/organization/units/${sampleUnitId}`, token);
    assert(
      'GET /api/organization/units/:id',
      detailRes.status === 200 &&
        detailRes.data &&
        detailRes.data.orgUnitId === sampleUnitId &&
        Array.isArray(detailRes.data.breadcrumb),
      `Code: ${detailRes.data?.code}, Depth: ${detailRes.data?.depth}`,
    );

    const childrenRes = await callNextBff(`/organization/units/${sampleUnitId}/children`, token);
    assert(
      'GET /api/organization/units/:id/children',
      childrenRes.status === 200 && Array.isArray(childrenRes.data),
      `Children: ${childrenRes.data?.length}`,
    );

    const ancestorsRes = await callNextBff(`/organization/units/${sampleUnitId}/ancestors`, token);
    assert(
      'GET /api/organization/units/:id/ancestors',
      ancestorsRes.status === 200 && Array.isArray(ancestorsRes.data),
      `Ancestors: ${ancestorsRes.data?.length}`,
    );

    const chainRes = await callNextBff(`/organization/units/${sampleUnitId}/approval-chain`, token);
    assert(
      'GET /api/organization/units/:id/approval-chain',
      chainRes.status === 200 && Array.isArray(chainRes.data),
      `Chain length: ${chainRes.data?.length}`,
    );

    const budgetRes = await callNextBff(`/organization/units/${sampleUnitId}/budget-owner`, token);
    assert(
      'GET /api/organization/units/:id/budget-owner',
      budgetRes.status === 200,
      `Budget owner: ${budgetRes.data?.code || 'None'}`,
    );

    const logRes = await callNextBff(`/organization/units/${sampleUnitId}/change-log`, token);
    assert(
      'GET /api/organization/units/:id/change-log',
      logRes.status === 200 && logRes.data && Array.isArray(logRes.data.data),
      `Log count: ${logRes.data?.total}`,
    );
  }

  const visibleRes = await callNextBff('/organization/me/visible-units', token);
  assert(
    'GET /api/organization/me/visible-units',
    visibleRes.status === 200 && Array.isArray(visibleRes.data),
    `Visible count: ${visibleRes.data?.length}`,
  );

  const exportRes = await callNextBff('/organization/units/export', token);
  const isExcel =
    exportRes.status === 200 &&
    (exportRes.headers['content-type']?.includes('spreadsheetml') ||
      exportRes.headers['content-type']?.includes('octet-stream'));
  const isQueued = exportRes.status === 202 && exportRes.data?.queued === true;
  assert(
    'GET /api/organization/units/export',
    isExcel || isQueued,
    `Status: ${exportRes.status}, Content-Type: ${exportRes.headers['content-type']}`,
  );

  // ---------------------------------------------------------------------------
  // 2. Mutations & Lifecycle Sequence
  // ---------------------------------------------------------------------------
  const rootId = sampleUnitId;
  const uniqueSuffix = Date.now().toString().slice(-4);
  const bu1Code = `BU1_${uniqueSuffix}`;
  const bu2Code = `BU2_${uniqueSuffix}`;
  const deptCode = `DEPT_${uniqueSuffix}`;

  // 2a. Create BU 1
  const createBu1 = await callNextBff('/organization/units', token, 'POST', {
    orgUnitTypeId: 2, // BUSINESS_UNIT
    parentOrgUnitId: rootId,
    code: bu1Code,
    name: `Business Unit 1 (${uniqueSuffix})`,
    effectiveFrom: '2026-09-01',
  });
  assert(
    'POST /api/organization/units (Create BU 1)',
    (createBu1.status === 200 || createBu1.status === 201) && createBu1.data?.code === bu1Code,
    `ID: ${createBu1.data?.orgUnitId}`,
  );
  const bu1Id = createBu1.data?.orgUnitId;

  // 2b. Create BU 2 (for move target)
  const createBu2 = await callNextBff('/organization/units', token, 'POST', {
    orgUnitTypeId: 2,
    parentOrgUnitId: rootId,
    code: bu2Code,
    name: `Business Unit 2 (${uniqueSuffix})`,
    effectiveFrom: '2026-09-01',
  });
  assert(
    'POST /api/organization/units (Create BU 2)',
    (createBu2.status === 200 || createBu2.status === 201) && createBu2.data?.code === bu2Code,
    `ID: ${createBu2.data?.orgUnitId}`,
  );
  const bu2Id = createBu2.data?.orgUnitId;

  // 2c. Create Department under BU 1
  const createDept = await callNextBff('/organization/units', token, 'POST', {
    orgUnitTypeId: 3, // DEPARTMENT
    parentOrgUnitId: bu1Id,
    code: deptCode,
    name: `Department (${uniqueSuffix})`,
    effectiveFrom: '2026-09-01',
  });
  assert(
    'POST /api/organization/units (Create Department under BU 1)',
    (createDept.status === 200 || createDept.status === 201) && createDept.data?.code === deptCode,
    `ID: ${createDept.data?.orgUnitId}, Depth: ${createDept.data?.depth}`,
  );
  const deptId = createDept.data?.orgUnitId;
  let deptRowVersion = createDept.data?.rowVersion;

  if (deptId) {
    // 2d. Update Department
    const updateRes = await callNextBff(`/organization/units/${deptId}`, token, 'PATCH', {
      name: `Updated Department (${uniqueSuffix})`,
    });
    assert(
      'PATCH /api/organization/units/:id (Update Dept)',
      updateRes.status === 200 && updateRes.data?.name?.includes('Updated'),
      `Name: ${updateRes.data?.name}`,
    );
    deptRowVersion = updateRes.data?.rowVersion;

    // 2e. Move Department from BU 1 to BU 2
    const moveRes = await callNextBff(`/organization/units/${deptId}/move`, token, 'POST', {
      newParentOrgUnitId: bu2Id,
      reason: 'Reorganization test move',
      rowVersion: deptRowVersion,
    });
    assert(
      'POST /api/organization/units/:id/move (Reparent Subtree)',
      moveRes.status === 200 && moveRes.data?.parentOrgUnitId === bu2Id,
      `New Parent: ${moveRes.data?.parentOrgUnitId}`,
    );

    // 2f. Deactivate Department
    const deactRes = await callNextBff(
      `/organization/units/${deptId}/deactivate`,
      token,
      'POST',
      { effectiveTo: '2026-12-31' },
    );
    assert(
      'POST /api/organization/units/:id/deactivate',
      deactRes.status === 200 && deactRes.data?.isActive === false,
      `IsActive: ${deactRes.data?.isActive}`,
    );

    // 2g. Activate Department
    const actRes = await callNextBff(`/organization/units/${deptId}/activate`, token, 'POST');
    assert(
      'POST /api/organization/units/:id/activate',
      actRes.status === 200 && actRes.data?.isActive === true,
      `IsActive: ${actRes.data?.isActive}`,
    );

    // 2h. Assign Manager
    const mgrRes = await callNextBff(
      `/organization/units/${deptId}/managers`,
      token,
      'POST',
      {
        userId: ADMIN_USER_ID,
        managerRoleCode: 'HEAD',
        isPrimary: true,
        effectiveFrom: '2026-09-01',
      },
    );
    assert(
      'POST /api/organization/units/:id/managers (Assign Manager)',
      (mgrRes.status === 200 || mgrRes.status === 201) && mgrRes.data?.isPrimary === true,
      `Manager Assigned: ${mgrRes.data?.userDisplayName || ADMIN_USER_ID}`,
    );
    const managerId = mgrRes.data?.orgUnitManagerId;

    // 2i. Get Managers
    const listMgrRes = await callNextBff(`/organization/units/${deptId}/managers`, token);
    assert(
      'GET /api/organization/units/:id/managers',
      listMgrRes.status === 200 && Array.isArray(listMgrRes.data) && listMgrRes.data.length >= 1,
      `Manager count: ${listMgrRes.data?.length}`,
    );

    // 2j. Get Current Head
    const currHeadRes = await callNextBff(
      `/organization/units/${deptId}/managers/current?asOfDate=2026-09-01`,
      token,
    );
    assert(
      'GET /api/organization/units/:id/managers/current',
      currHeadRes.status === 200 && currHeadRes.data?.userId === ADMIN_USER_ID,
      `Current Head: ${currHeadRes.data?.userDisplayName}`,
    );

    // 2k. Get User Managed Units
    const userUnitsRes = await callNextBff(
      `/organization/users/${ADMIN_USER_ID}/managed-units`,
      token,
    );
    assert(
      'GET /api/organization/users/:userId/managed-units',
      userUnitsRes.status === 200 && Array.isArray(userUnitsRes.data),
      `Managed units count: ${userUnitsRes.data?.length}`,
    );

    // 2l. Update Manager
    if (managerId) {
      const updateMgrRes = await callNextBff(
        `/organization/managers/${managerId}`,
        token,
        'PATCH',
        { effectiveTo: '2027-12-31' },
      );
      assert(
        'PATCH /api/organization/managers/:managerId',
        updateMgrRes.status === 200,
        `Updated Manager: ${managerId}`,
      );

      // 2m. Remove Manager
      const delMgrRes = await callNextBff(`/organization/managers/${managerId}`, token, 'DELETE');
      assert(
        'DELETE /api/organization/managers/:managerId',
        delMgrRes.status === 200,
        `Removed Manager: ${managerId}`,
      );
    }

    // 2n. Delete Department
    const delDeptRes = await callNextBff(`/organization/units/${deptId}`, token, 'DELETE');
    assert('DELETE /api/organization/units/:id (Dept)', delDeptRes.status === 200, `Deleted: ${deptId}`);
  }

  // Cleanup BUs
  if (bu1Id) await callNextBff(`/organization/units/${bu1Id}`, token, 'DELETE');
  if (bu2Id) await callNextBff(`/organization/units/${bu2Id}`, token, 'DELETE');

  console.log('\n================================================================');
  console.log(`  E2E Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
