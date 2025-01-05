
import { test, expect } from '@playwright/test';
import https from 'https';
import { variables } from '../variables.js';

const agent = new https.Agent({ rejectUnauthorized: false });
const startTime = Date.now();

test('different levels', async ({ request }) => {
  // Pre-request Script
  const prerequest_variables = {
  "page": 1
}

  const result = await request.get('https://reqres.in/api/users?page=2', { httpsAgent: agent } );
  
  const responseTime = Date.now() - startTime;

  // Post-response Script (Tests)

  // Status code is 200
    expect(result.status()).toBe(200);

  // Response body has the correct structure

    const response = await result.json();

  // Response time is less than 1000ms
    expect(responseTime).toBeLessThan(1000);

  // Verify email for user with id 9
    expect(response.data[2].email).toBe("tobias.funke@reqres.in");

  // Verify first name for user with id 9
    expect(response.data[2].first_name).toBe("Tobias");

  // Verify last name for user with id 9
    expect(response.data[2].last_name).toBe("Funke");

  // Verify avatar URL for user with id 9
    expect(response.data[2].avatar).toBe("https://reqres.in/img/faces/9-image.jpg");

});
