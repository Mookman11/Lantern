#!/usr/bin/env node
/**
 * Delete orphaned remote agent branches in one batch.
 * Usage: node scripts/delete-rogue-branches.js [audit-file.txt]
 * If no file provided, captures branch list automatically.
 */
const { spawn } = require("child_process");
const fs = require("fs");

const ROGUE_PATTERNS = [
  /^remotes\/origin\/claude\//,
  /^remotes\/origin\/codex\//,
  /^remotes\/origin\/devin\//,
  /^remotes\/origin\/gemini\//,
];

function run(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => { out += d.toString(); });
    proc.stderr.on("data", (d) => { err += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(err || `exit ${code}`));
    });
    proc.stdin.end();
  });
}

async function main() {
  const auditFile = process.argv[2];
  let branches = [];

  if (auditFile && fs.existsSync(auditFile)) {
    branches = fs.readFileSync(auditFile, "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
  } else {
    const raw = await run("git", ["branch", "-a"]);
    branches = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  }

  const toDelete = branches.filter((b) => ROGUE_PATTERNS.some((p) => p.test(b)));

  if (toDelete.length === 0) {
    console.log("No rogue branches found.");
    return;
  }

  console.log(`Found ${toDelete.length} rogue branch(es):`);
  for (const b of toDelete) console.log(`  ${b}`);

  console.log("\nDeleting...");
  for (const full of toDelete) {
    const remoteBranch = full.replace(/^remotes\/origin\//, "");
    try {
      await run("git", ["push", "origin", "--delete", remoteBranch]);
      console.log(`  ✓ Deleted origin/${remoteBranch}`);
    } catch (err) {
      console.error(`  ✗ Failed origin/${remoteBranch}: ${err.message}`);
    }
  }
  console.log("Done.");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
