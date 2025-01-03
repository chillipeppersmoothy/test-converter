### Usage

- Create a folder and navigate into it then run `npm run pw convert <location-of-saved-postman-collection>`

- You can alternatively run `npm run pw convert <location-of-saved-postman-collection> <preferred-location-to-save-the-converted-script>`

# Postman to Playwright Assertions

This document provides a mapping of common Postman assertions to their equivalent in Playwright.


## String Assertions

| Postman Assertion | Playwright Assertion |
| --- | --- |
| `pm.test("string is equal", function () { pm.expect(pm.response.text()).to.equal("expected string"); })` | `await expect(page.textContent()).toEqual("expected string");` |
| `pm.test("string includes", function () { pm.expect(pm.response.text()).to.include("substring"); })` | `await expect(page.textContent()).toContain("substring");` |
| `pm.test("string matches", function () { pm.expect(pm.response.text()).to.match(/regex/); })` | `await expect(page.textContent()).toMatch(/regex/);` |


## JSON Assertions

| Postman Assertion | Playwright Assertion |
| --- | --- |
| `pm.test("JSON is equal", function () { pm.expect(pm.response.json()).to.eql({ key: "value" }); })` | `await expect(await page.json()).toEqual({ key: "value" });` |
| `pm.test("JSON has key", function () { pm.expect(pm.response.json()).to.have.key("key"); })` | `await expect(await page.json()).toHaveProperty("key");` |
| `pm.test("JSON key is equal", function () { pm.expect(pm.response.json().key).to.equal("value"); })` | `await expect((await page.json()).key).toEqual("value");` |


## Status Code Assertions

| Postman Assertion | Playwright Assertion |
| --- | --- |
| `pm.test("status code is 200", function () { pm.expect(pm.response.code).to.equal(200); })` | `await expect(await page.response().status()).toEqual(200);` |
| `pm.test("status code is greater than 400", function () { pm.expect(pm.response.code).to.be.above(400); })` | `await expect(await page.response().status()).toBeGreaterThan(400);` |


## Header Assertions

| Postman Assertion | Playwright Assertion |
| --- | --- |
| `pm.test("header is present", function () { pm.expect(pm.response.headers["header-name"]).to.be.ok; })` | `await expect(await page.response().headers()["header-name"]).toBeTruthy();` |
| `pm.test("header value is equal", function () { pm.expect(pm.response.headers["header-name"]).to.equal("header-value"); })` | `await expect(await page.response().headers()["header-name"]).toEqual("header-value");` |


## Network Assertions

| Postman Assertion | Playwright Assertion |
| --- | --- |
| `pm.test("response time is less than 1000ms", function () { pm.expect(pm.response.responseTime).to.be.below(1000); })` | Not directly supported in Playwright, but can be achieved using `page.waitForResponse()` and `performance.now()`. |
