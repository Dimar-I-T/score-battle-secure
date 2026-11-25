import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db/config";

import {
  ADMIN_SESSION_COOKIE,
  hashSessionToken,
} from "@/lib/adminSession";

export async function POST() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get(
    ADMIN_SESSION_COOKIE
  )?.value;

  let status = 200;
  let message = "Successfully logged out.";

  try {
    if (sessionToken && /^[a-f0-9]{64}$/.test(sessionToken)) {
      const sessionHash = hashSessionToken(sessionToken);

      await pool.query(
        `DELETE FROM sessions
                 WHERE session_id = $1`,
        [sessionHash]
      );
    }
  } catch (error) {
    console.error("Admin logout error:", error);

    status = 500;
    message = "Failed to invalidate admin session.";
  }

  const response = NextResponse.json(
    {
      success: status === 200,
      message,
    },
    { status }
  );

  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}