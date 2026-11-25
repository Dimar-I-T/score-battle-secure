import { NextRequest, NextResponse } from "next/server";
import { adminLoginService } from "@/services/authService";
import { pool } from "@/lib/db/config";

import {
    ADMIN_SESSION_COOKIE,
    ADMIN_SESSION_MAX_AGE,
    generateSessionToken,
    hashSessionToken,
} from "@/lib/adminSession";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username and password are required.",
                },
                { status: 400 }
            );
        }

        const admin = await adminLoginService({
            username,
            password,
        });

        if (!admin || admin.role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid admin credentials.",
                },
                { status: 401 }
            );
        }

        const sessionToken = generateSessionToken();

        const sessionHash = hashSessionToken(sessionToken);

        const expiresAt = new Date(
            Date.now() + ADMIN_SESSION_MAX_AGE * 1000
        );

        await pool.query(
            `INSERT INTO sessions (
                session_id,
                username,
                expires_at
            )
            VALUES ($1, $2, $3)`,
            [
                sessionHash,
                admin.username,
                expiresAt,
            ]
        );

        const response = NextResponse.json({
            success: true,
            message: "Successfully logged in.",
            data: {
                username: admin.username,
                role: admin.role,
            },
        });

        response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: ADMIN_SESSION_MAX_AGE,
            expires: expiresAt,
        });

        return response;

    } catch (error) {
        console.error("Admin login error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error.",
            },
            { status: 500 }
        );
    }
}