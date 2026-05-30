import { prisma } from "@/app/lib/prisma";
import { hashPassword, isPasswordHash, verifyPassword } from "@/app/lib/password";
import { rateLimit } from "@/app/lib/request-security";
import { createToken } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const limited = rateLimit(req, "login", 8, 900000);
  if (limited) return limited;
  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: {
      login: body.login,
    },
  });

  if (!user || !verifyPassword(body.password, user.password)) {
    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 }
    );
  }

  if (!isPasswordHash(user.password)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashPassword(body.password) },
    });
  }

  const role = user.role === "admin" ? "admin" : "user";

  const token = await createToken({
    id: user.id,
    login: user.login,
    role,
  });

  const response = NextResponse.json({
    id: user.id,
    login: user.login,
    role,
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}