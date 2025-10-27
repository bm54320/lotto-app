import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { parseNumbers, validateDocumentId } from "../utils/validate.js";
import { v4 as uuidv4 } from "uuid";
import { generateQrPng } from "../utils/qr.js";

const router = Router();

// Uplata listića – vraća PNG (QR) s javnim URL-om listića
router.post("/tickets", async (req: Request, res: Response) => {
  if (!req.oidc?.isAuthenticated?.()) return res.status(401).send("Prijava je obavezna.");

  const current = await prisma.round.findFirst({ orderBy: { id: "desc" } });
  if (!current || current.status !== "ACTIVE") return res.status(400).send("Uplate nisu aktivne.");

  try {
    const { documentId, numbers } = req.body ?? {};
    validateDocumentId(String(documentId ?? ""));
    const parsed = parseNumbers(String(numbers ?? ""));

    const code = uuidv4();
    const created = await prisma.ticket.create({
      data: {
        code,
        documentId: String(documentId),
        numbers: parsed,
        roundId: current.id,
      },
    });

    const publicUrl = `${process.env.BASE_URL}/ticket/${created.code}`;
    const png = await generateQrPng(publicUrl);
    res.setHeader("Content-Type", "image/png");
    return res.status(200).send(png);
  } catch (e: any) {
    return res.status(400).send(e.message ?? "Neispravni podaci.");
  }
});

export default router;

