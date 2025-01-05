
import { test, expect } from '@playwright/test';
import https from 'https';
import { variables } from '../variables.js';

const agent = new https.Agent({ rejectUnauthorized: false });
const startTime = Date.now();

test('Remove user', async ({ request }) => {

  const result = await request.delete('https://reqres.in/api/users/2', {
  "data": ""
});
  
  const responseTime = Date.now() - startTime;

  // Post-response Script (Tests)

  // Status code is 204
    expect(result.status()).toBe(204);

  // Response time is less than 1000ms
    expect(responseTime).toBeLessThan(1000);

  // Verify the presence of 'content-length' header
    expect(result.headers()['content-length']).toBeDefined();

});
