import { getServerUser, forbiddenJson, isAdmin } from "@/app/lib/server-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getServerUser();

  if (!isAdmin(user)) {
    return forbiddenJson();
  }

  return NextResponse.json(user);
}
