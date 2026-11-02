"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="font-semibold text-lg">
        Next CMS
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {status === "loading" && null}
        {status === "authenticated" && session?.user ? (
          <>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <span className="text-gray-500">{session.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded bg-gray-900 px-3 py-1.5 text-white"
            >
              Logout
            </button>
          </>
        ) : (
          status === "unauthenticated" && (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded bg-gray-900 px-3 py-1.5 text-white"
              >
                Daftar
              </Link>
            </>
          )
        )}
      </div>
    </nav>
  );
}
