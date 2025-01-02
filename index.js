import { program } from "commander";
import convertPostmanToPlaywright from "./playwright/converter.js";

program
  .command("convert <postmanCollectionPath> <output> [postmanEnvironmentFile]")
  .action((postmanCollectionPath, output, postmanEnvironmentFile) => {
    convertPostmanToPlaywright(postmanCollectionPath, output, postmanEnvironmentFile);
  });

program.parse(process.argv);

// If no arguments are provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
