import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const token = (await cookies()).get("token")?.value || "";
  const result: any = {
    hasToken: Boolean(token),
    tokenLength: token.length,
    payloadLogin: null,
    userFound: false,
    role: null,
  };

  if (token) {
    try {
      const payload: any = await verifyToken(token);
      result.payloadLogin = payload?.login || null;

      if (result.payloadLogin) {
        const user = await prisma.user.findUnique({
          where: { login: result.payloadLogin },
          select: { login: true, role: true },
        });

        result.userFound = Boolean(user);
        result.role = user?.role || null;
      }
    } catch (error: any) {
      result.error = error?.message || "token error";
    }
  }

  return NextResponse.json(result);
}
