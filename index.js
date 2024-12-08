import { program } from "commander";
import convertPostmanToPlaywright from "./src/converter.js";

program
  .command("convert <postmanCollectionPath> <output>")
  .action((postmanCollectionPath, output) => {
    convertPostmanToPlaywright(postmanCollectionPath, output);
  });

program.parse(process.argv);
// If no arguments are provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}