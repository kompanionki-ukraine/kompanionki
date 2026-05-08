#!/usr/bin/env node
/**
 * Blocks the Agent (and Tab, if wired in hooks.json) from reading API env
 * files under .../api/ that may contain real secrets:
 *   - apps/api/.env, .env.local
 *   - apps/api/.env.production[.local], .env.development[.local], .env.staging[.local]
 *   - apps/api/.env.keys  (dotenvx private decryption keys — most critical)
 * Stays readable: .env.example, .env.*.example, .env.vault.
 */
async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString();
  const input = JSON.parse(raw || "{}");

  const paths = [];
  if (input.file_path) paths.push(input.file_path);
  if (Array.isArray(input.attachments)) {
    for (const a of input.attachments) {
      if (a?.file_path) paths.push(a.file_path);
    }
  }
  const ti = input.tool_input;
  if (ti?.file_path || ti?.path) {
    paths.push(ti.file_path || ti.path);
  }

  for (const p of paths) {
    if (isApiDotEnvPath(p)) {
      console.log(
        JSON.stringify({
          permission: "deny",
          user_message:
            "Reading API .env / .env.{production,development,staging,keys,local} is blocked by .cursor/hooks (secrets).",
        })
      );
      process.exit(0);
    }
  }

  console.log(JSON.stringify({ permission: "allow" }));
  process.exit(0);
}

const ALLOWED_API_ENV_BASENAMES = new Set([".env.vault"]);
const BLOCKED_API_ENV_BASENAME_RE =
  /^\.env(?:\.(?:keys|local|production|development|staging|production\.local|development\.local|staging\.local))?$/;

function isApiDotEnvPath(readPath) {
  if (!readPath || typeof readPath !== "string") return false;
  const normalized = readPath.replace(/\\/g, "/");
  const slash = normalized.lastIndexOf("/");
  const dir = slash === -1 ? "" : normalized.slice(0, slash);
  const basename = slash === -1 ? normalized : normalized.slice(slash + 1);

  const inApiDir = dir === "api" || dir.endsWith("/api");
  if (!inApiDir) return false;

  if (basename.endsWith(".example")) return false;
  if (ALLOWED_API_ENV_BASENAMES.has(basename)) return false;

  return BLOCKED_API_ENV_BASENAME_RE.test(basename);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
