const http = require("http");
const req = http.request({ hostname: "127.0.0.1", port: 4177, path: "/api/actions/run-loop", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
  let d = "";
  res.on("data", (c) => d += c);
  res.on("end", () => {
    try { const j = JSON.parse(d); console.log(JSON.stringify(j, null, 2)); }
    catch (e) { console.log("RAW:", d.slice(0, 500)); }
  });
});
req.on("error", (e) => console.log("ERR:", e.message));
req.end();
