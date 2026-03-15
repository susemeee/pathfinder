import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CONFIG_DIR = path.join(os.homedir(), ".pathfinder");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

interface Config {
  apiKey: string;
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function loadConfig(): Config | null {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return null;
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    const config = JSON.parse(raw) as Config;
    return config.apiKey ? config : null;
  } catch {
    return null;
  }
}

export function saveConfig(config: Config): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export function getApiKey(): string {
  const config = loadConfig();
  if (!config) {
    throw new Error(
      "API 키가 설정되지 않았습니다. `pathfinder login` 명령으로 먼저 설정해주세요."
    );
  }
  return config.apiKey;
}
