const http = require("http");
const req = http.request({ hostname: "127.0.0.1", port: 4177, path: "/api/actions/run-loop", method: "POST" }, (res) => {
  let d = "";
  res.on("data", (c) => d += c);
  res.on("end", () => {
    console.log("status:", res.statusCode);
    console.log("content-type:", res.headers["content-type"]);
    try {
      const j = JSON.parse(d);
      console.log("json keys:", Object.keys(j).join(","));
      console.log("json.ok:", j.ok);
      console.log("json.body type:", typeof j);
    } catch (e) {
      console.log("not json, first 300 chars:", d.slice(0, 300));
    }
  });
});
req.on("error", (e) => console.log("ERR:", e.message));
req.end();
