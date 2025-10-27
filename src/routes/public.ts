import { Router, Request, Response } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const current = await prisma.round.findFirst({ orderBy: { id: "desc" } });
  const ticketCount = current ? await prisma.ticket.count({ where: { roundId: current.id } }) : null;
  const isActive = current?.status === "ACTIVE";
  const drawnNumbers = current?.drawnNumbers && current.drawnNumbers.length > 0 ? current.drawnNumbers : null;
  res.render("index", {
    user: req.oidc?.user ?? null,
    isAuthenticated: req.oidc?.isAuthenticated?.() ?? false,
    ticketCount,
    drawnNumbers,
    isActive,
  });
});

router.get("/ticket/:code", async (req: Request, res: Response) => {
  const ticket = await prisma.ticket.findUnique({ where: { code: req.params.code }, include: { round: true } });
  if (!ticket) return res.status(404).send("Ticket not found");
  
  res.render("ticket", { ticket });
});

export default router;

