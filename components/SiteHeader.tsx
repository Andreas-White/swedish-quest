import Link from "next/link";
import { auth, signOut } from "@/auth";
import ThemeSwitcher from "./ThemeSwitcher";
import { I } from "./icons";

export default async function SiteHeader() {
  const session = await auth();
  return (
    <header className="sitehead">
      <Link href="/" className="brand">
        <span className="logo">SQ</span>
        <span className="bname">Swedish Quest</span>
      </Link>
      <nav className="snav">
        <Link href="/" className="nbtn">{I.home(15)}<span>Quest</span></Link>
        {session?.user ? (
          <>
            <span className="userchip">{session.user.name ?? session.user.email}</span>
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}>
              <button className="nbtn ghost" type="submit">Log out</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="nbtn ghost">Log in</Link>
            <Link href="/signup" className="nbtn primary">Sign up</Link>
          </>
        )}
      </nav>
      <details className="tsettings">
        <summary className="nbtn ghost" aria-label="Appearance settings">🎨 <span>Look</span></summary>
        <div className="tpop card">
          <ThemeSwitcher compact />
        </div>
      </details>
    </header>
  );
}
