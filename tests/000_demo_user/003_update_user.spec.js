
import { test, expect } from '@playwright/test';
import https from 'https';
import { variables } from '../variables.js';

const agent = new https.Agent({ rejectUnauthorized: false });
const startTime = Date.now();

test('Update user', async ({ request }) => {

  const result = await request.put('https://reqres.in/api/users/3', {
  "data": {
    "name": "morpheus",
    "job": "zion resident"
  }
});
  
  const responseTime = Date.now() - startTime;

  // Post-response Script (Tests)

  // Status code is 200
    expect(result.status()).toBe(200);

  // Response time is less than 1000ms
    expect(responseTime).toBeLessThan(1000);

  // Verify response body properties

  // Content-Type header is present
    expect(result.headers()['content-type']).toBeDefined();

});
