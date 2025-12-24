import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fsp from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Frontend Vite default: http://localhost:3000
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  })
);
app.use(express.json({ limit: "1mb" }));

const dataDir = path.resolve(__dirname, "../data");
const dataFile = path.resolve(dataDir, "feedback.json");

async function ensureStore() {
  await fsp.mkdir(dataDir, { recursive: true });
  try {
    await fsp.access(dataFile);
  } catch {
    await fsp.writeFile(dataFile, JSON.stringify({ feedbacks: [] }, null, 2), "utf-8");
  }
}

async function readStore() {
  await ensureStore();
  const raw = await fsp.readFile(dataFile, "utf-8");
  const store = raw ? JSON.parse(raw) : { feedbacks: [] };
  store.feedbacks = Array.isArray(store.feedbacks) ? store.feedbacks : [];
  return store;
}

async function writeStore(store) {
  await ensureStore();
  await fsp.writeFile(dataFile, JSON.stringify(store, null, 2), "utf-8");
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// List feedbacks (for admin panel later)
app.get("/api/feedback", async (_req, res) => {
  try {
    const store = await readStore();
    res.json({ ok: true, feedbacks: store.feedbacks });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message ?? "internal_error" });
  }
});

// ----------------------
// Simple JSON auth (demo)
// ----------------------
const usersFile = path.resolve(dataDir, "users.json");

async function ensureUsersStore() {
  await fsp.mkdir(dataDir, { recursive: true });
  try {
    await fsp.access(usersFile);
  } catch {
    await fsp.writeFile(usersFile, JSON.stringify({ users: [] }, null, 2), "utf-8");
  }
}

async function readUsersStore() {
  await ensureUsersStore();
  const raw = await fsp.readFile(usersFile, "utf-8");
  const store = raw ? JSON.parse(raw) : { users: [] };
  store.users = Array.isArray(store.users) ? store.users : [];
  return store;
}

async function writeUsersStore(store) {
  await ensureUsersStore();
  await fsp.writeFile(usersFile, JSON.stringify(store, null, 2), "utf-8");
}

function sanitizeUser(u) {
  // do not return password to client
  const { password, ...rest } = u;
  return rest;
}

// Register -> role is member by default
app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body ?? {};
    const name = String(fullName ?? "").trim();
    const em = String(email ?? "").trim().toLowerCase();
    const pw = String(password ?? "");

    if (!name || !em || !pw) {
      res.status(400).json({ ok: false, error: "fullName/email/password is required" });
      return;
    }

    const store = await readUsersStore();
    const exists = store.users.some((u) => String(u.email).toLowerCase() === em);
    if (exists) {
      res.status(409).json({ ok: false, error: "email_already_exists" });
      return;
    }

    const user = {
      id: `U_${Date.now()}`,
      fullName: name,
      email: em,
      password: pw,
      role: "member",
      createdAt: new Date().toISOString(),
    };

    store.users.push(user);
    await writeUsersStore(store);

    res.json({ ok: true, user: sanitizeUser(user) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message ?? "internal_error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    const em = String(email ?? "").trim().toLowerCase();
    const pw = String(password ?? "");

    if (!em || !pw) {
      res.status(400).json({ ok: false, error: "email/password is required" });
      return;
    }

    const store = await readUsersStore();
    const user = store.users.find((u) => String(u.email).toLowerCase() === em && String(u.password) === pw);

    if (!user) {
      res.status(401).json({ ok: false, error: "invalid_credentials" });
      return;
    }

    res.json({ ok: true, user: sanitizeUser(user) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message ?? "internal_error" });
  }
});

// List users (admin use later)
app.get("/api/users", async (_req, res) => {
  try {
    const store = await readUsersStore();
    res.json({ ok: true, users: store.users.map(sanitizeUser) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message ?? "internal_error" });
  }
});

// Submit feedback
app.post("/api/submit_feedback", async (req, res) => {
  try {
    const payload = req.body ?? {};
    const userId = String(payload.userId ?? "anonymous");
    const title = String(payload.title ?? "").trim();
    const content = String(payload.content ?? "").trim();

    if (!title || !content) {
      res.status(400).json({ ok: false, error: "title/content is required" });
      return;
    }

    const store = await readStore();
    const feedback = {
      id: `FB_${Date.now()}`,
      userId,
      title,
      content,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    store.feedbacks.push(feedback);
    await writeStore(store);

    res.json({ ok: true, feedback });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message ?? "internal_error" });
  }
});

// ----------------------
// Response Management
// ----------------------
const responsesFile = path.resolve(dataDir, "responses.json");

async function ensureResponsesStore() {
  await fsp.mkdir(dataDir, { recursive: true });
  try {
    await fsp.access(responsesFile);
  } catch {
    await fsp.writeFile(responsesFile, JSON.stringify({ responses: [] }, null, 2), "utf-8");
  }
}

async function readResponsesStore() {
  await ensureResponsesStore();
  const raw = await fsp.readFile(responsesFile, "utf-8");
  const store = raw ? JSON.parse(raw) : { responses: [] };
  store.responses = Array.isArray(store.responses) ? store.responses : [];
  return store;
}

async function writeResponsesStore(store) {
  await ensureResponsesStore();
  await fsp.writeFile(responsesFile, JSON.stringify(store, null, 2), "utf-8");
}

// Admin gửi phản hồi
app.post("/api/feedback/:feedbackId/respond", async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { adminId, content } = req.body ?? {};
    
    if (!content?.trim()) {
      res.status(400).json({ ok: false, error: "content is required" });
      return;
    }

    // Kiểm tra feedback có tồn tại không
    const feedbackStore = await readStore();
    const feedback = feedbackStore.feedbacks.find(f => f.id === feedbackId);
    if (!feedback) {
      res.status(404).json({ ok: false, error: "feedback_not_found" });
      return;
    }

    // Tạo response
    const responseStore = await readResponsesStore();
    const response = {
      id: `RES_${Date.now()}`,
      feedbackId,
      userId: feedback.userId,
      adminId: adminId || "admin",
      content: content.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    responseStore.responses.push(response);
    await writeResponsesStore(responseStore);

    // Cập nhật trạng thái feedback
    feedback.status = "responded";
    await writeStore(feedbackStore);

    res.json({ ok: true, response });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message ?? "internal_error" });
  }
});

// Lấy các phản hồi của user
app.get("/api/responses/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const store = await readResponsesStore();
    const userResponses = store.responses.filter(r => r.userId === userId);
    res.json({ ok: true, responses: userResponses });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message ?? "internal_error" });
  }
});

// Đánh dấu response đã đọc
app.post("/api/responses/:responseId/read", async (req, res) => {
  try {
    const { responseId } = req.params;
    const store = await readResponsesStore();
    const response = store.responses.find(r => r.id === responseId);
    
    if (!response) {
      res.status(404).json({ ok: false, error: "response_not_found" });
      return;
    }

    response.isRead = true;
    await writeResponsesStore(store);

    res.json({ ok: true, response });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message ?? "internal_error" });
  }
});

// Lấy tất cả responses (admin)
app.get("/api/responses", async (_req, res) => {
  try {
    const store = await readResponsesStore();
    res.json({ ok: true, responses: store.responses });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message ?? "internal_error" });
  }
});

// Backward compatibility: some clients may call /api/auth/*
app.post("/api/auth/register", (req, res, next) => {
  req.url = "/api/auth/register";
  next();
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Auth: POST http://localhost:${port}/api/auth/register | /api/auth/login`);
});