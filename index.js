import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ✅ Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// ✅ Run Gola code endpoint
app.post("/run", (req, res) => {
  const code = req.body.code;
  if (!code) return res.status(400).json({ error: "No code provided" });

  const gola = spawn("./gola");

  let output = "";
  gola.stdout.on("data", (data) => {
    output += data.toString();
  });

  gola.stderr.on("data", (data) => {
    output += data.toString();
  });

  gola.on("close", () => {
    res.json({ output });
  });

  gola.stdin.write(code + "\n");
  gola.stdin.end();
});

// ✅ Keep alive (to prevent Render sleep)
setInterval(() => {
  console.log("Pinged to stay alive");
}, 10 * 60 * 1000); // every 10 mins

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
