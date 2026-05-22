import { prisma } from "@/app/lib/prisma";
import { createToken } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: {
      login: body.login,
    },
  });

  if (!user || user.password !== body.password) {
    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 }
    );
  }

  const token = await createToken({
    id: user.id,
    login: user.login,
    role: user.login === "admin" ? "admin" : "user",
  });

  const response = NextResponse.json({
    id: user.id,
    login: user.login,
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}