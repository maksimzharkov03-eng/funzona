import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export type ServerUser = {
  id: number;
  login: string;
  role: string;
};

export async function getServerUser(): Promise<ServerUser | null> {
  const token = (await cookies()).get("token")?.value;

  if (!token) return null;

  try {
    const payload: any = await verifyToken(token);
    const login = String(payload?.login || "").trim();

    if (!login) return null;

    const user = await prisma.user.findUnique({
      where: { login },
      select: { id: true, login: true, role: true },
    });

    return user || null;
  } catch {
    return null;
  }
}

export function isAdmin(user: ServerUser | null) {
  return user?.role === "admin";
}

export async function requireAdminUser() {
  const user = await getServerUser();
  return isAdmin(user) ? user : null;
}

export function unauthorizedJson(message = "Нужно войти в аккаунт") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenJson(message = "Нет доступа") {
  return NextResponse.json({ error: message }, { status: 403 });
}
