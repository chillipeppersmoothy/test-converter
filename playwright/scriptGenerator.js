import { promises as fs } from "fs";
import { join, relative } from "path";
import { createHash } from "crypto";
import {
  sanitizeFileName,
  replaceVariables,
  cleanCarriageReturns,
} from "./utils.js";

let variables = {};
let itemCounter = 0;
let convertedScripts = new Map();
let prerequest_variables = {};

async function createPackageJson(outputDir) {
  if (!outputDir) {
    console.error("Output directory is undefined");
    return;
  }

  const packageJsonContent = {
    name: "playwright-tests",
    version: "1.0.0",
    scripts: {
      test: "playwright test",
    },
    dependencies: {
      "@playwright/test": "^1.0.0",
    },
  };

  const packageJsonPath = join(outputDir, "package.json");
  await fs.writeFile(
    packageJsonPath,
    JSON.stringify(packageJsonContent, null, 2),
    "utf8"
  );
}

function replacePathParams(url, params) {
  const paramsMap = Object.fromEntries(
    params.map((param) => [param.key, param.value])
  );
  return url.replace(/:(\w+)/g, (_, key) => {
    if (key in paramsMap) {
      return paramsMap[key];
    }
    throw new Error(`Missing value for path parameter: ${key}`);
  });
}

function replaceQueryParams(url, query) {
  const queryMap = Object.fromEntries(
    query.map((param) => [param.key, param.value])
  );

  if (!prerequest_variables || !Object.keys(prerequest_variables).length)
    return url;

  let replacedUrl = url;

  for (const [key, value] of Object.entries(queryMap)) {
    const match = value?.match(/{{(.*?)}}/);
    if (match === null) continue;
    const variableName = match[1];

    if (prerequest_variables[key]) {
      replacedUrl = url.replace(
        /([?&])([^&=]+)=({{(.*?)}})/g,
        (match, delimeter, key, placeholder, paramName) => {
          return `${delimeter}${key}=${
            prerequest_variables[paramName] || placeholder
          }`;
        }
      );
    } else if (prerequest_variables.hasOwnProperty(variableName)) {
      queryMap[key] = prerequest_variables[variableName];
      replacedUrl = url.replace(
        /([?&])([^&=]+)=({{(.*?)}})/g,
        (match, delimeter, key, placeholder, paramName) => {
          return `${delimeter}${key}=${
            prerequest_variables[paramName] || placeholder
          }`;
        }
      );
    }
  }
  return replacedUrl;
}

function convertPreRequestScript(script) {
  if (!script) return "";

  let convertedScript = "  // Pre-request Script\n";
  const cleanedData = cleanCarriageReturns(script);
  const lines = cleanedData.split("\n");
  const regex = /(?<=\.set\(['"])([^'"]+)['"],\s*([^)]*)\)/g;

  lines.forEach((line) => {
    if (line.includes("pm.variables.set")) {
      let match;
      if ((match = regex.exec(line)) !== null) {
        const key = match[1];
        const value = match[2]?.trim()?.replace(/['"]/g, "");
        prerequest_variables[key] = isNaN(value) ? value : Number(value);
      }
    } else if (
      line.includes("pm.collectionVariables.set") ||
      line.includes("pm.environment.set") ||
      line.includes("pm.globals.set")
    ) {
      let match;
      while ((match = regex.exec(line)) !== null) {
        const key = match[1];
        const value = match[2]?.trim()?.replace(/['"]/g, "");
        variables[key] = isNaN(value) ? value : Number(value);
      }
    } else {
      convertedScript += `  ${line}\n`;
    }
  });

  convertedScript += `  const prerequest_variables = ${JSON.stringify(
    prerequest_variables,
    null,
    2
  )}\n`;
  return convertedScript;
}

function convertPostResponseScript(script) {
  if (!script) return "";

  const scriptHash = createHash("md5").update(script).digest("hex");
  if (convertedScripts.has(scriptHash)) {
    return convertedScripts.get(scriptHash);
  }

  let convertedScript = "// Post-response Script (Tests)\n";
  const cleanedData = cleanCarriageReturns(script);
  const lines = cleanedData.split("\n");
  let insideTest = false;
  let currentTestName = "";

  lines.forEach((line) => {
    if (line.includes("pm.response.json()")) {
      const match = line.match(
        /(?:var|let|const) (\w+) = pm.response.json\(\);/
      );

      if (match) {
        const variableName = match[1];
        convertedScript += `\n    const ${variableName} = await result.json();\n`;
      }
    } else if (line.includes("pm.test(")) {
      insideTest = true;
      const match = line.match(/pm\.test\("(.+?)"/);
      if (match) {
        currentTestName = match[1];
        convertedScript += `\n  // ${currentTestName}\n`;
      }
    } else if (insideTest && line.includes("});")) {
      insideTest = false;
    } else if (insideTest) {
      if (line.includes("pm.response.to.have.status")) {
        convertedScript += `    expect(result.status()).toBe(${
          line.match(/\d+/)[0]
        });\n`;
      } else if (
        line.includes("pm.expect(pm.response.responseTime).to.be.below")
      ) {
        convertedScript += `    expect(responseTime).toBeLessThan(${
          line.match(/\d+/)[0]
        });\n`;
      } else if (line.includes("pm.expect")) {
        const playwrightAssert = line
          .replace("pm.expect", "expect")
          .replace(".to.eql(", ".toEqual(")
          .replace(".to.equal(", ".toBe(")
          .replace(".to.have.property(", "data.")
          .replace(".to.include(", ".toContain(");
        convertedScript += `${playwrightAssert}\n`;
      }
    }
  });

  convertedScripts.set(scriptHash, convertedScript);
  return convertedScript;
}

export function generatePlaywrightTest(item, folderPath, outputDir) {
  const { name, request, event } = item;
  const { method, url, header, body } = request;

  let preRequestScript = "";
  let postResponseScript = "";

  if (event) {
    const preRequestEvent = event.find((e) => e.listen === "prerequest");
    const testEvent = event.find((e) => e.listen === "test");

    if (preRequestEvent && preRequestEvent.script) {
      preRequestScript = convertPreRequestScript(
        preRequestEvent.script.exec.join("\n")
      );
    }

    if (testEvent && testEvent.script) {
      postResponseScript = convertPostResponseScript(
        testEvent.script.exec.join("\n")
      );
    }
  }

  let requestOptions = {};
  if (header && header.length > 0) {
    requestOptions.headers = header.reduce(
      (acc, h) => ({ ...acc, [h.key]: replaceVariables(h.value, variables) }),
      {}
    );
  }
  if (body && body.mode === "raw") {
    try {
      if (body.options.raw.language === "json") {
        requestOptions.data = JSON.parse(replaceVariables(body.raw, variables));
      } else if (body.options.raw.language === "xml") {
        requestOptions.data = replaceVariables(body.raw, variables);
        requestOptions.headers = {
          ...requestOptions.headers,
          "Content-Type": "application/xml",
        };
      }
    } catch {
      requestOptions.data = replaceVariables(body.raw, variables);
    }
  }

  let requestUrl = url?.raw
    ? replaceVariables(url.raw, variables)
    : "undefined_url";
  requestUrl =
    url?.variable?.length > 0
      ? replacePathParams(requestUrl, url.variable)
      : requestUrl;
  requestUrl =
    url?.query?.length > 0
      ? replaceQueryParams(requestUrl, url.query)
      : requestUrl;
  requestUrl = replaceVariables(requestUrl, variables);

  const relativePath = relative(folderPath, outputDir).replace(/\\/g, "/");
  const variablesImport = relativePath
    ? `import { variables } from '${relativePath}/variables.js';`
    : `import { variables } from './variables.js';`;

  prerequest_variables = {};

  return `
import { test, expect } from '@playwright/test';
import https from 'https';
${variablesImport}

const agent = new https.Agent({ rejectUnauthorized: false });
const startTime = Date.now();

test('${name}', async ({ request }) => {
${preRequestScript}
  const result = await request.${method.toLowerCase()}('${requestUrl}'${
    Object.keys(requestOptions).length > 0
      ? `, {...${JSON.stringify(requestOptions, null, 2)}, httpsAgent: agent }`
      : `, { httpsAgent: agent } `
  });
  
  const responseTime = Date.now() - startTime;

  ${postResponseScript}
});
`;
}

async function processItem(item, parentPath = "", outputDir) {
  if (!outputDir) {
    console.error("Output directory is undefined");
    return;
  }
  const itemNumber = String(itemCounter++).padStart(3, "0");

  if (item.item) {
    // This is a folder
    const folderPath = join(
      parentPath,
      `${itemNumber}_${sanitizeFileName(item.name)}`
    );
    await fs.mkdir(folderPath, { recursive: true });

    // Process folder-level pre-request scripts
    if (item.event) {
      const preRequestEvent = item.event.find((e) => e.listen === "prerequest");
      if (preRequestEvent && preRequestEvent.script) {
        convertPreRequestScript(preRequestEvent.script.exec.join("\n"));
      }
    }

    for (const subItem of item.item) {
      await processItem(subItem, folderPath, outputDir);
    }
  } else if (item.request) {
    // This is a request
    const testScript = generatePlaywrightTest(item, parentPath, outputDir);
    const fileName = `${itemNumber}_${sanitizeFileName(item.name)}.spec.js`;
    const filePath = join(parentPath, fileName);
    await fs.writeFile(filePath, testScript);
  }
}

export async function processCollection(
  collection,
  outputDir,
  postmanEnvironment
) {
  if (!outputDir) {
    throw new Error("Output directory is undefined");
  }
  console.log(`Processing collection. Output directory: ${outputDir}`);

  if (collection.variable) {
    collection.variable.forEach((v) => {
      variables[v.key] = v.value;
    });
  }

  if (postmanEnvironment && postmanEnvironment.values) {
    postmanEnvironment.values.forEach((v) => {
      variables[v.key] = v.value;
    });
  }

  itemCounter = 0;
  convertedScripts.clear(); // Clear the converted scripts before processing a new collection
  for (const item of collection.item) {
    await processItem(item, outputDir, outputDir);
  }

  // Create a variables.js file to export the variables
  const variablesJsContent = `export const variables = ${JSON.stringify(
    variables,
    null,
    2
  )};`;
  const variablesJsPath = join(outputDir, "variables.js");
  await fs.writeFile(variablesJsPath, variablesJsContent);

  await createPackageJson(outputDir);
}
