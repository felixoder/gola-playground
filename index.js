import express from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// --- MAIN ENDPOINT ---
app.post("/run", async (req, res) => {
  const code = req.body.code;
  if (!code) return res.status(400).json({ error: "No code provided" });

  const tempFile = path.join("/tmp", "temp.gola");
  fs.writeFileSync(tempFile, code);

  exec(`./gola ${tempFile}`, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: stderr || error.message });
    res.json({ output: stdout });
  });
});

// --- Health route ---
app.get("/", (req, res) => {
  res.send("✅ Gola playground is alive!");
});

// --- Keep-alive ping every 10 min (600 000 ms) ---
const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
setInterval(() => {
  console.log("Pinging self to keep Render awake…");
  fetch(SELF_URL).catch(() => {}); // ignore errors
}, 600_000); // 10 minutes

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
