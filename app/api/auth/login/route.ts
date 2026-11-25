import { NextRequest, NextResponse } from "next/server";
import { loginService } from "@/services/authService";
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();
        const payload = await loginService({ username, password });
        const secret = process.env.JWT_PRIVATE_SECRET?.replace(/\\n/g, '\n');
        if (!secret) {
            throw Error('no secret key');
        }

        const token = jwt.sign(payload, secret, {
            expiresIn: "24h",
            algorithm: 'ES256'
        });

        const response = NextResponse.json({
            success: true,
            message: "Successfully logged in",
            data: payload
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24
        });

        return response;
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}