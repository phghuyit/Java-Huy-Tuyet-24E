import { writeFileSync } from 'node:fs';

// Run against the existing backend. Only users created by this run are deleted.
const baseUrl = (process.argv[2] || 'http://localhost:8080').replace(/\/$/, '');
const results = [];
const createdIds = new Set();
const suffix = crypto.randomUUID().replaceAll('-', '');
const email = `api-test-${suffix}@example.com`;
const otherEmail = `api-test-other-${suffix}@example.com`;
function randomPhone() {
  return `0${String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000_000).padStart(9, '0')}`;
}
let phone = randomPhone();
let otherPhone = randomPhone();
const missingId = '9223372036854775807';
let sessionCookie = '';
let authenticated = false;

function check(name, actual, expected) {
  const passed = actual === expected;
  results.push({ name, passed, expected, actual });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}: ${JSON.stringify(actual)}`);
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = await request('GET', '/api/auth/csrf');
    if (csrf.status !== 200) throw new Error('Cannot obtain CSRF token');
    headers[csrf.data.headerName] = csrf.data.token;
  }
  if (sessionCookie) headers.Cookie = sessionCookie;
  const response = await fetch(baseUrl + path, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(15000),
  });
  for (const cookie of response.headers.getSetCookie()) {
    if (cookie.startsWith('JSESSIONID=')) sessionCookie = cookie.split(';')[0];
  }
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = null; }
  if (method === 'POST' && path === '/users' && response.ok && data?.id) createdIds.add(data.id);
  return { status: response.status, data, text };
}

try {
  if (!process.env.API_TEST_EMAIL || !process.env.API_TEST_PASSWORD) {
    throw new Error('Set API_TEST_EMAIL and API_TEST_PASSWORD for an ADMIN account before running');
  }
  check('Anonymous users denied', (await request('GET', '/users')).status, 401);
  const loginResponse = await request('POST', '/api/auth/login', {
    email: process.env.API_TEST_EMAIL, password: process.env.API_TEST_PASSWORD,
  });
  check('ADMIN login', loginResponse.status, 200);
  if (loginResponse.status !== 200) throw new Error('ADMIN login failed; dependent tests stopped');
  authenticated = true;
  const roles = await request('GET', '/api/roles');
  check('GET roles', roles.status, 200);
  const codes = roles.data.map(role => role.code).sort();
  check('Four expected roles', codes.join(','), 'ADMIN,CUSTOMER,RECEPTIONIST,STAFF');
  const customer = roles.data.find(role => role.code === 'CUSTOMER');
  const staff = roles.data.find(role => role.code === 'STAFF');
  check('GET one role', (await request('GET', `/api/roles/${staff.id}`)).data?.code, 'STAFF');
  check('Unknown role', (await request('GET', `/api/roles/${missingId}`)).status, 404);
  check('Role id zero', (await request('GET', '/api/roles/0')).status, 400);
  check('Role id negative', (await request('GET', '/api/roles/-1')).status, 400);

  const users = await request('GET', '/users');
  check('GET users', users.status, 200);
  check('User list is array', Array.isArray(users.data), true);
  check('No password secrets in user list', /"(?:password|passwordHash|password_hash)"\s*:/i.test(users.text), false);
  check('Existing users have roles', users.data.every(user => user.roleId && user.roleCode && user.roleName) ? true : false, true);
  const usedPhones = new Set(users.data.map(user => user.phone));
  while (usedPhones.has(phone)) phone = randomPhone();
  while (usedPhones.has(otherPhone) || otherPhone === phone) otherPhone = randomPhone();

  const body = { fullName: '  API Role Test  ', email: `  ${email.toUpperCase()}  `, phone };
  const created = await request('POST', '/users', body);
  check('Create user', created.status, 201);
  if (!created.data?.id) throw new Error('Create did not return a user id; dependent tests stopped');
  const id = created.data.id;
  check('Default CUSTOMER role', created.data.roleCode, 'CUSTOMER');
  check('Default role id matches role list', created.data.roleId, customer.id);
  check('Normalize full name', created.data.fullName, 'API Role Test');
  check('Normalize email', created.data.email, email);
  check('No password secrets in create response', /"(?:password|passwordHash|password_hash)"\s*:/i.test(created.text), false);
  const fetched = await request('GET', `/users/${id}`);
  check('GET created user', fetched.status, 200);
  check('Read persisted default role', fetched.data?.roleCode, 'CUSTOMER');

  check('Duplicate email', (await request('POST', '/users', { ...body, phone: otherPhone })).status, 409);
  check('Duplicate phone', (await request('POST', '/users', { ...body, email: otherEmail })).status, 409);
  for (const [name, fields, expected] of [
    ['Blank full name', { fullName: '   ' }, 400],
    ['Invalid email', { email: 'invalid' }, 400],
    ['Invalid phone', { phone: 'abc' }, 400],
    ['Unknown role on create', { roleId: missingId }, 404],
    ['Zero role on create', { roleId: 0 }, 400],
    ['Negative role on create', { roleId: -1 }, 400],
  ]) {
    check(name, (await request('POST', '/users', { ...body, email: otherEmail, phone: otherPhone, ...fields })).status, expected);
  }

  const updateBody = { fullName: 'API Role Updated', email, phone, roleId: staff.id };
  const updated = await request('PUT', `/users/${id}`, updateBody);
  check('Update user and role', updated.status, 200);
  check('Updated name', updated.data?.fullName, updateBody.fullName);
  check('Updated role', updated.data?.roleCode, 'STAFF');
  check('Role persists after update', (await request('GET', `/users/${id}`)).data?.roleId, staff.id);
  const { roleId, ...withoutRole } = updateBody;
  const preserved = await request('PUT', `/users/${id}`, withoutRole);
  check('Update without role', preserved.status, 200);
  check('Omitted role preserved', preserved.data?.roleCode, 'STAFF');
  const nullRole = await request('PUT', `/users/${id}`, { ...withoutRole, roleId: null });
  check('Null role preserved', nullRole.status === 200 && nullRole.data?.roleCode === 'STAFF', true);
  check('Unknown role on update', (await request('PUT', `/users/${id}`, { ...updateBody, fullName: 'Must not persist', roleId: missingId })).status, 404);
  const afterInvalid = await request('GET', `/users/${id}`);
  check('Failed update leaves role unchanged', afterInvalid.data?.roleCode, 'STAFF');
  check('Failed update leaves name unchanged', afterInvalid.data?.fullName, updateBody.fullName);
  check('Invalid phone on update', (await request('PUT', `/users/${id}`, { ...updateBody, phone: 'abc' })).status, 400);

  const explicit = await request('POST', '/users', { fullName: 'API Explicit Role Test', email: otherEmail, phone: otherPhone, roleId: staff.id });
  check('Create with explicit role', explicit.status, 201);
  check('Explicit role stored', explicit.data?.roleCode, 'STAFF');
  check('Duplicate email on update', (await request('PUT', `/users/${id}`, { ...updateBody, email: otherEmail })).status, 409);
  check('Duplicate phone on update', (await request('PUT', `/users/${id}`, { ...updateBody, phone: otherPhone })).status, 409);
  check('Unknown user GET', (await request('GET', `/users/${missingId}`)).status, 404);
  check('Unknown user PUT', (await request('PUT', `/users/${missingId}`, updateBody)).status, 404);
  check('Unknown user DELETE', (await request('DELETE', `/users/${missingId}`)).status, 404);
} catch (error) {
  check('Test execution completed', error.message, 'No error');
} finally {
  for (const id of createdIds) {
    try {
      const deleted = await request('DELETE', `/users/${id}`);
      check(`Cleanup test user ${id}`, deleted.status, 204);
      check(`Deleted user ${id} is gone`, (await request('GET', `/users/${id}`)).status, 404);
    } catch (error) {
      check(`Cleanup test user ${id}`, error.message, 'Deleted successfully');
    }
  }
  if (authenticated) {
    try { check('Logout test session', (await request('POST', '/api/auth/logout')).status, 204); }
    catch (error) { check('Logout test session', error.message, 'Logged out'); }
  }
  const report = {
    testedAt: new Date().toISOString(), baseUrl,
    passed: results.filter(result => result.passed).length,
    failed: results.filter(result => !result.passed).length,
    results,
  };
  writeFileSync(new URL('./latest-user-role-api-results.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log(`RESULT: ${report.passed} passed, ${report.failed} failed`);
  process.exitCode = report.failed ? 1 : 0;
}
