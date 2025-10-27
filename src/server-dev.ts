import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Home page
app.get("/", (_req, res) => {
  res.send("Dev server is running.");
});

/**
 * Dev versions of the management endpoints.
 * No Auth0 required here, but the behavior mimics production.
 * These handlers store state in memory so you can test quickly.
 */

type Round = { id: number; status: "ACTIVE" | "CLOSED"; results: number[] };
let rounds: Round[] = [];
let nextId = 1;

function validateNumbers(numbers: unknown): { ok: boolean; reason?: string; list?: number[] } {
  if (!Array.isArray(numbers)) return { ok: false, reason: "numbers must be an array" };
  if (numbers.length < 6 || numbers.length > 10) return { ok: false, reason: "length 6..10 required" };
  const list = numbers.map(n => Number(n));
  if (list.some(n => !Number.isInteger(n))) return { ok: false, reason: "all numbers must be integers" };
  if (list.some(n => n < 1 || n > 45)) return { ok: false, reason: "numbers must be between 1 and 45" };
  const set = new Set(list);
  if (set.size !== list.length) return { ok: false, reason: "numbers must be unique" };
  return { ok: true, list };
}

app.post("/app/new-round", (_req: Request, res: Response) => {
  const hasActive = rounds.some(r => r.status === "ACTIVE");
  if (!hasActive) rounds.push({ id: nextId++, status: "ACTIVE", results: [] });
  res.status(204).end();
});

app.post("/app/close", (_req: Request, res: Response) => {
  const current = [...rounds].reverse().find(r => r.status === "ACTIVE");
  if (current) current.status = "CLOSED";
  res.status(204).end();
});

app.post("/app/store-results", (req: Request, res: Response) => {
  const { numbers } = req.body ?? {};
  const valid = validateNumbers(numbers);
  if (!valid.ok) return res.status(400).json({ error: "bad_request", reason: valid.reason });

  const current = rounds[rounds.length - 1];
  if (!current) return res.status(400).json({ error: "no_round" });
  if (current.status === "ACTIVE") return res.status(400).json({ error: "round_active" });
  if (current.results.length > 0) return res.status(400).json({ error: "results_exist" });

  current.results = valid.list!;
  res.status(204).end();
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`🧪 Development server running on http://localhost:${port}`);
  console.log("🔗 Available routes:");
  console.log(`   - POST /app/new-round`);
  console.log(`   - POST /app/close`);
  console.log(`   - POST /app/store-results  { "numbers": [1,2,3,4,5,6] }`);
});
