import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 9173;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/execute-command", (req, res) => {
  const { command } = req.body;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      res.json({ error: error.message });
      return;
    }
    if (stderr) {
      res.json({ error: stderr });
      return;
    }
    res.json({ output: stdout });
  });
});

app.get("/download-zip", (req, res) => {
  const { tool } = req?.query;
  const folderPath = path.join(__dirname, "destination_file_path");
  const zipPath = path.join(__dirname, `${tool}.zip`);

  // Check if the folder exists
  if (!fs.existsSync(folderPath)) {
    console.error("Folder does not exist:", folderPath);
    return res.status(404).json({ error: "Folder not found" });
  }

  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  output.on("close", () => {
    console.log(
      `Zip file created: ${zipPath} (${archive.pointer()} total bytes)`
    );
    res.download(zipPath, "converted_files.zip", (err) => {
      if (err) {
        console.error("Error downloading zip file:", err);
      }
      fs.unlinkSync(zipPath); // Delete the zip file after download
      fs.rmSync(folderPath, { recursive: true, force: true }); // Delete the folder after zipping
    });
  });

  archive.on("error", (err) => {
    console.error("Error creating zip file:", err);
    throw err;
  });

  archive.pipe(output);
  archive.directory(folderPath, false);
  archive.finalize();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
