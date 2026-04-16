import * as fs from "fs";
import * as path from "path";

export function loadEnvLocal() {
  const envLocalPath = path.resolve(".env.local");

  if (!fs.existsSync(envLocalPath)) {
    console.warn("Warning: .env.local not found. Using system environment variables.");
    return;
  }

  const content = fs.readFileSync(envLocalPath, "utf8");
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim();

    // Remove quotes if present
    const cleanValue = value.replace(/^["']|["']$/g, "");

    if (key && !process.env[key]) {
      process.env[key] = cleanValue;
    }
  }
}

export function printCurrentConfig() {
  console.log("Current Configuration:");
  console.log(`  API Key: ${process.env.OPENAI_API_KEY?.slice(0, 10)}...`);
  console.log(`  Base URL: ${process.env.OPENAI_API_BASE || "https://api.openai.com/v1"}`);
  console.log(`  Model: ${process.env.MODEL_NAME || "gpt-4o"}`);
}
