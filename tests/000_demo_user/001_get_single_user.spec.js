
import { test, expect } from '@playwright/test';
import https from 'https';
import { variables } from '../variables.js';

const agent = new https.Agent({ rejectUnauthorized: false });
const startTime = Date.now();

test('Get Single user', async ({ request }) => {

  const result = await request.get('https://reqres.in/api/users/2', { httpsAgent: agent } );
  
  const responseTime = Date.now() - startTime;

  // Post-response Script (Tests)

  // Status code is 200
    expect(result.status()).toBe(200);

    const response = await result.json();

  // User email is present in the response
    expect(response.data.email).toBe("janet.weaver@reqres.in");

  // Content-Type header is present and has the value 'application/json; charset=utf-8'
    expect(result.headers()['content-type']).toBe('application/json; charset=utf-8');

  // Support URL is 'https://contentcaddy.io?utm_source=reqres&utm_medium=json&utm_campaign=referral'
    expect(response.support.url).toBe("https://contentcaddy.io?utm_source=reqres&utm_medium=json&utm_campaign=referral");

  // User ID is 2
    expect(response.data.id).toBe(2);

  // User first name is Janet
    expect(response.data.first_name).toBe("Janet");

  // User last name is Weaver
    expect(response.data.last_name).toBe("Weaver");

  // User avatar URL is valid
    expect(response.data.avatar).toContain("https://reqres.in/img/faces/");

});
