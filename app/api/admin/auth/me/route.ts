import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminSession";

export async function GET() {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin login required.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully retrieved admin session.",
      data: admin,
    });

  } catch (error) {
    console.error("Admin session error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}