const { execSync } = require("child_process");
const fs = require("fs");

try {
  const out = execSync("node tests/test_dream_chat_refactor.js", { encoding: "utf-8", timeout: 60000 });
  fs.writeFileSync("tmp_refactor_results.txt", out, "utf-8");
  console.log("PASS");
} catch (err) {
  fs.writeFileSync("tmp_refactor_results.txt", (err.stdout || "") + "\n" + (err.stderr || "") + "\nEXIT:" + err.status, "utf-8");
  console.log("FAIL", err.status);
}
