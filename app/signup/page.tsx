import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Signup() {
  const session = await auth();
  if (session?.user) redirect("/");

  async function signup(fd: FormData) {
    "use server";
    const { prisma } = await import("@/lib/db");
    const { hash } = await import("bcryptjs");
    const name = String(fd.get("name") ?? "").trim().slice(0, 40);
    const email = String(fd.get("email") ?? "").toLowerCase().trim();
    const password = String(fd.get("password") ?? "");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 8) redirect("/signup?error=bad");
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.passwordHash) redirect("/signup?error=exists");
    const passwordHash = await hash(password, 10);
    if (existing) {
      await prisma.user.update({ where: { email }, data: { passwordHash, name: name || existing.name } });
    } else {
      await prisma.user.create({ data: { email, name: name || null, passwordHash } });
    }
    redirect("/login?error=created");
  }

  return (
    <div className="card anim">
      <h1>Create account</h1>
      <p>Email + password. No email server needed.</p>
      <form action={signup}>
        <input type="text" name="name" maxLength={40} placeholder="Display name (optional)" style={{ width: "100%", padding: 10, marginBottom: 8 }} />
        <input type="email" name="email" required placeholder="you@example.com" style={{ width: "100%", padding: 10, marginBottom: 8 }} />
        <input type="password" name="password" required minLength={8} placeholder="Password (min 8)" style={{ width: "100%", padding: 10 }} />
        <div className="row"><button className="p" type="submit">Create account</button></div>
      </form>
      <p>Already have one? <Link href="/login">Log in</Link></p>
    </div>
  );
}
