
import { test, expect } from '@playwright/test';
import https from 'https';
import { variables } from '../variables.js';

const agent = new https.Agent({ rejectUnauthorized: false });
const startTime = Date.now();

test('Page', async ({ request }) => {
  // Pre-request Script
  const prerequest_variables = {
  "PageNo": 2
}

  const result = await request.get('https://reqres.in/api/users?page=2', { httpsAgent: agent } );
  
  const responseTime = Date.now() - startTime;

  // Post-response Script (Tests)

  // Status code is 200
    expect(result.status()).toBe(200);

  // Response time is less than 1000ms
    expect(responseTime).toBeLessThan(1000);

    const response = await result.json();

  // Validate response body structure
    expect(Object.keys(response)).toEqual(expect.arrayContaining(['page', 'per_page', 'total', 'total_pages', 'data', 'support']));

  // Number of elements in the 'data' array
    expect(response.data.length).toBe(6);

  // Verify the presence of user with id 7
    expect(response.data.some(user => user.id === 7)).toBe(true);

  // Verify the email of the user with id 7
    expect(response.data.find(user => user.id === 7).email).toEqual("michael.lawson@reqres.in");

  // Verify the first name of the user with id 7
    expect(response.data.find(user => user.id === 7).first_name).toEqual("Michael");

  // Verify the last name of the user with id 7
    expect(response.data.find(user => user.id === 7).last_name).toEqual("Lawson");

  // Verify the avatar of the user with id 7
    expect(response.data.find(user => user.id === 7).avatar).toEqual("https://reqres.in/img/faces/7-image.jpg");

});
