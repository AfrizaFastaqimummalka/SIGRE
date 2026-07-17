import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi login tidak valid. Silakan login ulang.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const response = await fetch("http://127.0.0.1:8000/api/auth/change-password/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json(
            {
                success: false,
                message: data.message || "Gagal mengubah password.",
            },
            { status: response.status }
        );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Password berhasil diubah. Silakan login ulang.",
    });

  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server saat mengubah password.",
      },
      { status: 500 },
    );
  }
}
