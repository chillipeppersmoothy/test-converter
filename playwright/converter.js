import { promises as fs } from "fs";
import { processCollection } from "./scriptGenerator.js";
const { readFile, mkdir } = fs;

async function convertPostmanToPlaywright(
  postmanCollectionPath,
  outputDir = process.cwd(),
  postmanEnvironmentFile
) {
  try {
    const postmanCollection = JSON.parse(
      await readFile(postmanCollectionPath, "utf-8")
    );

    let postmanEnvironment = null;
    if (postmanEnvironmentFile) {
      postmanEnvironment = JSON.parse(
        await readFile(postmanEnvironmentFile, "utf-8")
      );
    }

    await mkdir(outputDir, { recursive: true });

    await processCollection(postmanCollection, outputDir, postmanEnvironment);

    console.log("Conversion complete. Playwright scripts have been generated.");
  } catch (error) {
    console.error("Error converting Postman collection:", error.message);
    process.exit(1);
  }
}

export default convertPostmanToPlaywright;
