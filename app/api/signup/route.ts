import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const Body = z.object({
  name: z.string().trim().max(40).optional().default(""),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

// POST /api/signup — create email+password account. No SMTP needed.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid name, email or password (min 8 chars)" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    return Response.json({ error: "Account already exists — log in instead" }, { status: 409 });
  }
  const passwordHash = await hash(parsed.data.password, 10);
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, name: parsed.data.name || existing.name },
    });
  } else {
    await prisma.user.create({
      data: { email, name: parsed.data.name || null, passwordHash },
    });
  }
  return Response.json({ ok: true });
}
