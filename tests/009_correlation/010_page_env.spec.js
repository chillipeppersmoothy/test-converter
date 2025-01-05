
import { test, expect } from '@playwright/test';
import https from 'https';
import { variables } from '../variables.js';

const agent = new https.Agent({ rejectUnauthorized: false });
const startTime = Date.now();

test('page env', async ({ request }) => {

  const result = await request.get('https://reqres.in/api/users?page=1', { httpsAgent: agent } );
  
  const responseTime = Date.now() - startTime;

  // Post-response Script (Tests)

  // Response code is 200
    expect(result.status()).toBe(200);

  // Response time is less than 1000ms
    expect(responseTime).toBeLessThan(1000);

    const response = await result.json();

  // Response body has correct page number
    expect(response.page).toBe(1);

  // Response body has data array with 6 elements
    expect(response.data.length).toBe(6);

  // Verify the presence of user with id 3
    expect(response.data.some(user => user.id === 3)).toBe(true);

  // Verify the email of the user with id 3
    expect(response.data.find(user => user.id === 3).email).toEqual("emma.wong@reqres.in");

  // Verify the first name of the user with id 3
    expect(response.data.find(user => user.id === 3).first_name).toEqual("Emma");

  // Verify the last name of the user with id 3
    expect(response.data.find(user => user.id === 3).last_name).toEqual("Wong");

  // Verify the avatar of the user with id 3
    expect(response.data.find(user => user.id === 3).avatar).toEqual("https://reqres.in/img/faces/3-image.jpg");

});
