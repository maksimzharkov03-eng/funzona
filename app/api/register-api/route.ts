import { prisma } from "@/app/lib/prisma";
import { rateLimit } from "@/app/lib/request-security";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const limited = rateLimit(req, "register", 5, 3600000);
  if (limited) return limited;
  try {
    const body = await req.json();

    if (!body.login || !body.password) {
      return NextResponse.json(
        { error: "Введите логин и пароль" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        login: body.login,
        password: body.password,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}