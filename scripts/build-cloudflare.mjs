import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../node_modules/vinext/dist/cli.js", import.meta.url));
const result = spawnSync(process.execPath, [cli, "build"], {
  stdio: "inherit",
  env: { ...process.env, APJ_DEPLOY_TARGET: "cloudflare" },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
