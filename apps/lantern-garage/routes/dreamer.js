// Dreamer notebook and agent list
module.exports = async function dreamerRoutes(req, res, url, deps) {
  const { sendJson, collectRequestBody, path, repoRoot,
    normalizeDreamerUser, dreamerNotebookPath, appendDreamerEntry,
    readDreamerNotebook, readRecentDreams, dreamChatReply, AGENT_PERSONAS } = deps;

  if (url.pathname === "/api/dreamer" && req.method === "GET") {
    const user = normalizeDreamerUser(url.searchParams.get("user") || "dreamer");
    const entries = readDreamerNotebook(user);
    sendJson(res, { user, entries, path: path.relative(repoRoot, dreamerNotebookPath(user)) });
    return true;
  }
  if (url.pathname === "/api/dreamer" && req.method === "POST") {
    try {
      const raw = await collectRequestBody(req);
      const body = JSON.parse(raw);
      const user = normalizeDreamerUser(body.user || "dreamer");
      const record = await appendDreamerEntry(user, body);
      sendJson(res, { saved: true, record });
    } catch (error) {
      sendJson(res, { error: error.message }, 400);
    }
    return true;
  }
  if (url.pathname === "/api/dreamer/upload" && req.method === "POST") {
    try {
      const { fs } = deps;
      const boundary = req.headers["content-type"]?.split("boundary=")[1];
      if (!boundary) throw new Error("No boundary in multipart request");

      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      const body = buffer.toString("utf8");

      // Parse multipart form data
      const parts = body.split("--" + boundary);
      const fields = {};
      let fileBuffer = null;
      let fileName = "";

      for (const part of parts) {
        if (!part.includes("Content-Disposition")) continue;
        const headerEnd = part.indexOf("\r\n\r\n");
        if (headerEnd === -1) continue;

        const header = part.substring(0, headerEnd);
        const content = part.substring(headerEnd + 4).replace(/\r\n--$/, "").replace(/\r\n$/, "");

        const nameMatch = header.match(/name="([^"]+)"/);
        const fileNameMatch = header.match(/filename="([^"]+)"/);

        if (fileNameMatch) {
          fileName = fileNameMatch[1];
          fileBuffer = Buffer.from(content, "utf8");
        } else if (nameMatch) {
          const fieldName = nameMatch[1];
          fields[fieldName] = content;
        }
      }

      const user = normalizeDreamerUser(fields.user || "dreamer");
      const kind = String(fields.kind || "note").slice(0, 40);
      const name = String(fields.name || "").slice(0, 120);
      const text = String(fields.text || "").slice(0, 2000);
      let tags = [];
      try { tags = JSON.parse(fields.tags || "[]"); } catch {}

      // Save file if present
      let filePath = "";
      if (fileBuffer && fileName) {
        const videoDir = path.join(repoRoot, "data", "dreamer", "videos");
        fs.mkdirSync(videoDir, { recursive: true });
        filePath = path.join(videoDir, `${Date.now()}-${fileName}`);
        fs.writeFileSync(filePath, fileBuffer);
      }

      // Create entry
      const record = await appendDreamerEntry(user, { kind, name, text, tags });

      sendJson(res, {
        saved: true,
        record,
        file: filePath ? { name: fileName, path: path.relative(repoRoot, filePath), size: fileBuffer.length } : null,
      });
    } catch (error) {
      sendJson(res, { error: error.message }, 400);
    }
    return true;
  }
  if (url.pathname === "/api/dreamer/chat" && req.method === "POST") {
    try {
      const raw = await collectRequestBody(req);
      const body = JSON.parse(raw);
      const user = normalizeDreamerUser(body.user || "orion");
      const kind = String(body.kind || "dream").slice(0, 40);
      const text = String(body.text || "").slice(0, 4000);
      const record = await appendDreamerEntry(user, { kind, text, name: body.name, mood: body.mood, tags: body.tags });
      const recentDreams = readRecentDreams(5);
      const chatResult = await dreamChatReply(`[${kind}] ${text}`, recentDreams, body.agent || "", body.provider || "");
      if (!chatResult.reply) {
        sendJson(res, { saved: true, record, error: chatResult.error || "no_provider_configured", agent: chatResult.agent, online: false, help: chatResult.help || "", suggestions: chatResult.suggestions || [] }, 503);
        return true;
      }
      sendJson(res, {
        saved: true, record,
        reply: chatResult.reply, agent: chatResult.agent,
        source: chatResult.online ? "llm" : "offline",
        suggestions: chatResult.suggestions,
      });
    } catch (error) {
      sendJson(res, { error: error.message }, 400);
    }
    return true;
  }
  if (url.pathname === "/api/agents" && req.method === "GET") {
    sendJson(res, {
      agents: AGENT_PERSONAS.map((a) => ({ id: a.id, name: a.name, symbol: a.symbol })),
      default: AGENT_PERSONAS[0].id,
    });
    return true;
  }
  if (url.pathname === "/api/agents/slots" && req.method === "GET") {
    try {
      const fs = require("fs");
      const claudePath = path.join(repoRoot, ".claude", "agent-slots.json");
      const manifestPath = path.join(repoRoot, "manifests", "dream-journal-v1-agent-slots.json");
      let slotsPath = claudePath;
      if (!fs.existsSync(claudePath)) {
        if (!fs.existsSync(manifestPath)) {
          sendJson(res, { error: "agent-slots.json not found" }, 404);
          return true;
        }
        slotsPath = manifestPath;
      }
      if (!fs.existsSync(slotsPath)) {
        sendJson(res, { error: "agent-slots.json not found" }, 404);
        return true;
      }
      const raw = require("fs").readFileSync(slotsPath, "utf8");
      const data = JSON.parse(raw);
      sendJson(res, {
        slots: data.slots.map((s) => ({
          id: s.id,
          agent: s.agent,
          provider: s.provider,
          model: s.model,
          status: s.status,
          responsibilities: s.responsibilities,
          fallback: s.quotaTracking?.fallbackAgent || null,
        })),
        routing: data.routing?.dailyBootOrder || [],
        weights: data.routing?.weights || {},
      });
    } catch (error) {
      sendJson(res, { error: error.message }, 500);
    }
    return true;
  }
};
