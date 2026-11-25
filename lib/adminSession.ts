import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { pool } from "@/lib/db/config";

export const ADMIN_SESSION_COOKIE = "admin_session";

export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24; 

export function generateSessionToken(): string {
    return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export async function getAdminSession() {
    const cookieStore = await cookies();

    const sessionToken = cookieStore.get(
        ADMIN_SESSION_COOKIE
    )?.value;

    if (!sessionToken) {
        return null;
    }

    if (!/^[a-f0-9]{64}$/.test(sessionToken)) {
        return null;
    }

    const sessionHash = hashSessionToken(sessionToken);

    const result = await pool.query(
        `SELECT s.username, u.role
         FROM sessions s
         JOIN users u ON s.username = u.username
         WHERE s.session_id = $1
           AND s.expires_at > NOW()
           AND u.role = 'admin'
         LIMIT 1`,
        [sessionHash]
    );

    return result.rows[0] ?? null;
}