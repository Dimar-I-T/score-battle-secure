import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminSession";
import { pool } from "@/lib/db/config";

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const admin = await getAdminSession();

        if (!admin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized.",
                },
                { status: 401 }
            );
        }

        const { username } = await context.params;
        const { score } = await req.json();

        if (!Number.isInteger(score) || score < 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid score.",
                },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `UPDATE users
             SET score = $1
             WHERE username = $2
             RETURNING username, score`,
            [score, username]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Score successfully updated.",
            data: result.rows[0],
        });

    } catch (error) {
        console.error("Admin score update error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error.",
            },
            { status: 500 }
        );
    }
}