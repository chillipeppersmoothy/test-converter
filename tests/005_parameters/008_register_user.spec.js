
import { test, expect } from '@playwright/test';
import https from 'https';
import { variables } from '../variables.js';

const agent = new https.Agent({ rejectUnauthorized: false });
const startTime = Date.now();

test('Register user', async ({ request }) => {

  const result = await request.post('https://reqres.in/api/register', {
  "data": {
    "email": "eve.holt@reqres.in",
    "password": "pistol"
  }
});
  
  const responseTime = Date.now() - startTime;

  // Post-response Script (Tests)

  // Status code is 200
    expect(result.status()).toBe(200);

  // Response time is less than 1000ms
    expect(responseTime).toBeLessThan(1000);

});
