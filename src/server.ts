import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { oidc, requireM2M, ensureScope } from "./auth.js";
import publicRoutes from "./routes/public.js";
import ticketsRoutes from "./routes/tickets.js";
import { prisma } from "./db.js";

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Debug: log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// OIDC middleware (login/logout: /login, /logout, /callback)
app.use(oidc);

// Rute
app.use(publicRoutes);
app.use(ticketsRoutes);

// M2M API endpoints (prema specifikaciji) - samo za eksterne pozive s tokenom
// Privremeno maknut scope check jer Auth0 M2M app nema konfigurirane scope-ove

// Aktiviraj novo kolo
app.post("/new-round", requireM2M, async (_req: Request, res: Response) => {
  const current = await prisma.round.findFirst({ orderBy: { id: "desc" } });
  if (current?.status === "ACTIVE") return res.status(204).end();
  await prisma.round.create({ data: { status: "ACTIVE", drawnNumbers: [] } });
  return res.status(204).end();
});

// Deaktiviraj trenutno kolo
app.post("/close", requireM2M, async (_req: Request, res: Response) => {
  const current = await prisma.round.findFirst({ orderBy: { id: "desc" } });
  if (!current || current.status === "CLOSED") return res.status(204).end();
  await prisma.round.update({ where: { id: current.id }, data: { status: "CLOSED" } });
  return res.status(204).end();
});

// Spremi izvučene brojeve
app.post("/store-results", requireM2M, async (req: Request, res: Response) => {
  const current = await prisma.round.findFirst({ orderBy: { id: "desc" } });
  if (!current || current.status !== "CLOSED" || current.drawnNumbers.length > 0) {
    return res.status(400).send("Brojevi se ne mogu pohraniti u ovom stanju.");
  }

  const nums = (req.body?.numbers ?? []) as number[];
  if (!Array.isArray(nums)) return res.status(400).send("numbers mora biti polje brojeva.");

  await prisma.round.update({
    where: { id: current.id },
    data: { drawnNumbers: nums },
  });

  return res.status(204).end();
});

// === BACKEND WRAPPER ENDPOINTI ZA UI (bez potrebe za tokenom od korisnika) ===
// Direktno pozivaju biz logiku bez HTTP poziva

// UI: Aktiviraj novo kolo
app.post("/api/admin/activate-round", async (_req: Request, res: Response) => {
  try {
    const current = await prisma.round.findFirst({ orderBy: { id: "desc" } });
    if (current?.status === "ACTIVE") {
      return res.json({ success: true, message: 'Kolo je već aktivno' });
    }
    await prisma.round.create({ data: { status: "ACTIVE", drawnNumbers: [] } });
    return res.json({ success: true, message: 'Kolo aktivirano' });
  } catch (error: any) {
    console.error('Error activating round:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// UI: Zatvori kolo
app.post("/api/admin/close-round", async (_req: Request, res: Response) => {
  try {
    const current = await prisma.round.findFirst({ orderBy: { id: "desc" } });
    if (!current || current.status === "CLOSED") {
      return res.json({ success: true, message: 'Kolo je već zatvoreno' });
    }
    await prisma.round.update({ where: { id: current.id }, data: { status: "CLOSED" } });
    return res.json({ success: true, message: 'Kolo zatvoreno' });
  } catch (error: any) {
    console.error('Error closing round:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// UI: Spremi izvučene brojeve
app.post("/api/admin/store-results", async (req: Request, res: Response) => {
  try {
    const { numbers } = req.body;
    if (!Array.isArray(numbers) || numbers.length !== 6) {
      return res.status(400).json({ success: false, message: 'Potrebno je točno 6 brojeva' });
    }
    
    const current = await prisma.round.findFirst({ orderBy: { id: "desc" } });
    
    if (!current || current.status !== "CLOSED") {
      return res.status(400).json({ success: false, message: 'Kolo mora biti zatvoreno prije unosa brojeva' });
    }
    
    if (current.drawnNumbers.length > 0) {
      return res.status(400).json({ success: false, message: 'Brojevi su već uneseni za ovo kolo' });
    }

    await prisma.round.update({
      where: { id: current.id },
      data: { drawnNumbers: numbers },
    });

    return res.json({ success: true, message: 'Rezultati spremljeni' });
  } catch (error: any) {
    console.error('Error storing results:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Stranica za uplatu listića
app.get("/pay", (req: Request, res: Response) => {
  if (!req.oidc?.isAuthenticated?.()) return res.redirect("/login");
  res.render("pay", {
    user: req.oidc?.user ?? null,
    isAuthenticated: req.oidc?.isAuthenticated?.() ?? false,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on :${port}`));
