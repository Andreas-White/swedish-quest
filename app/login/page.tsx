import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, auth } from "@/auth";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (session?.user) redirect("/");
  const { error } = await searchParams;

  const emailReady = !!process.env.EMAIL_SERVER;
  const googleReady = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  async function loginPassword(fd: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
        redirectTo: "/",
      });
    } catch (e) {
      if (e instanceof AuthError) redirect("/login?error=bad");
      throw e;
    }
  }

  return (
    <div className="card anim">
      <h1>Log in</h1>
      <p>Start at Chapter 1. Progress is strictly sequential.</p>
      {error === "bad" && <p><b>Wrong email or password.</b></p>}
      {error === "created" && <p><b>Account created — log in below.</b></p>}

      <h2>Email + password</h2>
      <form action={loginPassword}>
        <input type="email" name="email" required placeholder="you@example.com" style={{ width: "100%", padding: 10, marginBottom: 8 }} />
        <input type="password" name="password" required minLength={8} placeholder="Password (min 8)" style={{ width: "100%", padding: 10 }} />
        <div className="row"><button className="p" type="submit">Log in</button></div>
      </form>
      <p>No account yet? <Link href="/signup">Create one with email + password</Link> — no email server needed.</p>

      <h2>Other options</h2>
      {emailReady ? (
        <form action={async (fd: FormData) => {
          "use server";
          await signIn("email", { email: fd.get("email"), redirectTo: "/" });
        }}>
          <input type="email" name="email" required placeholder="you@example.com" style={{ width: "100%", padding: 10 }} />
          <div className="row"><button type="submit">Email me a login link</button></div>
        </form>
      ) : (
        <p className="lock">Passwordless email link: not configured (needs EMAIL_SERVER in .env).</p>
      )}
      {googleReady ? (
        <form action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}>
          <div className="row"><button type="submit">Continue with Google</button></div>
        </form>
      ) : (
        <p className="lock">Google: not configured (needs AUTH_GOOGLE_ID/SECRET).</p>
      )}
    </div>
  );
}
