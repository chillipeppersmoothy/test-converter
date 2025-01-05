
import { test, expect } from '@playwright/test';
import https from 'https';
import { variables } from '../variables.js';

const agent = new https.Agent({ rejectUnauthorized: false });
const startTime = Date.now();

test('create user', async ({ request }) => {

  const result = await request.post('https://reqres.in/api/users', {
  "data": {
    "name": "morpheus",
    "job": "leader"
  }
});
  
  const responseTime = Date.now() - startTime;

  // Post-response Script (Tests)

  // Status code is 201
    expect(result.status()).toBe(201);

  // Response body contains the correct name and job
    expect((await result.json()).name).toBe('morpheus');
    expect((await result.json()).job).toBe('leader');

  // Content-Type header is present
    expect(result.headers()['content-type']).toBeDefined();

  // Response time is less than 1000ms
    expect(responseTime).toBeLessThan(1000);

});
