import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const payload: any = await verifyToken(token);

    return NextResponse.json({
      id: payload.id,
      login: payload.login,
      role: payload.login === "admin" ? "admin" : "user",
    });
  } catch {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
}
