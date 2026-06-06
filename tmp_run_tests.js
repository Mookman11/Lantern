const { execSync } = require("child_process");
const fs = require("fs");

try {
  const out = execSync("node tests/test_dream_chat_refactor.js", {
    encoding: "utf-8",
    timeout: 60000,
  });
  fs.writeFileSync("tmp_test_results.txt", out, "utf-8");
  console.log("Tests completed. Output saved to tmp_test_results.txt");
} catch (err) {
  fs.writeFileSync("tmp_test_results.txt", err.stdout || err.message, "utf-8");
  console.log("Tests failed. Output saved to tmp_test_results.txt");
}
