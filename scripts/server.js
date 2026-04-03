import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");

app.use(express.static(path.join(__dirname, "../public")));

// Helper: Recursively list .md files in data/
function listMarkdownFiles(dir, base = "") {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const relPath = path.join(base, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(listMarkdownFiles(filePath, relPath));
    } else if (file.endsWith(".md")) {
      results.push(relPath.replace(/\\/g, "/"));
    }
  });
  return results;
}

// Rota para listar arquivos .md
app.get("/api/list", (req, res) => {
  const files = listMarkdownFiles(DATA_DIR);
  res.json(files);
});

// Rota para pegar conteúdo de um .md
app.get("/api/file", (req, res) => {
  const relPath = req.query.path;
  if (!relPath || relPath.includes(".."))
    return res.status(400).send("Invalid path");
  const filePath = path.join(DATA_DIR, relPath);
  if (!fs.existsSync(filePath)) return res.status(404).send("Not found");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading file");
    res.send(data);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
