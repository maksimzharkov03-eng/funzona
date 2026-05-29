import { NextResponse } from "next/server";
import { forbiddenJson, requireAdminUser } from "@/app/lib/server-auth";

export const dynamic = "force-dynamic";

const ENDPOINTS = [
  "/api/v2/check_balance",
  "/api/v2/balance",
  "/api/v2/get_balance",
  "/api/v2/user/balance",
  "/api/v2/profile",
  "/api/v2/user_info",
  "/api/v2/account",
];

function getBaseUrl() {
  return (process.env.NS_GIFTS_BASE_URL || "https://api.ns.gifts").replace(/\/$/, "");
}

function getProxyHeaders() {
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  if (process.env.NS_GIFTS_PROXY_KEY) {
    headers["x-proxy-key"] = process.env.NS_GIFTS_PROXY_KEY;
  }

  return headers;
}

async function callRaw(method: "GET" | "POST", endpoint: string, token?: string) {
  const headers = getProxyHeaders();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${getBaseUrl()}${endpoint}`, {
      method,
      headers,
      body: method === "POST" ? JSON.stringify({}) : undefined,
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    return {
      method,
      endpoint,
      status: res.status,
      ok: res.ok,
      durationMs: Date.now() - startedAt,
      json,
      text: text.slice(0, 500),
    };
  } catch (error) {
    return {
      method,
      endpoint,
      status: 0,
      ok: false,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function getToken() {
  const login = process.env.NS_GIFTS_LOGIN;
  const password = process.env.NS_GIFTS_PASSWORD;
  const userId = process.env.NS_GIFTS_USER_ID;

  if (!login || !password || !userId) {
    return {
      token: "",
      result: {
        ok: false,
        error: "Нет NS_GIFTS_LOGIN / NS_GIFTS_PASSWORD / NS_GIFTS_USER_ID",
      },
    };
  }

  const headers = getProxyHeaders();
  const res = await fetch(`${getBaseUrl()}/api/v2/get_token`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      login,
      password,
      user_id: userId,
    }),
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  return {
    token: typeof data?.token === "string" ? data.token : "",
    result: {
      ok: res.ok,
      status: res.status,
      data,
      text: text.slice(0, 500),
    },
  };
}

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) {
    return forbiddenJson();
  }

  const tokenData = await getToken();
  const results = [];

  for (const endpoint of ENDPOINTS) {
    results.push(await callRaw("GET", endpoint, tokenData.token));
    results.push(await callRaw("POST", endpoint, tokenData.token));
  }

  return NextResponse.json({
    baseUrl: getBaseUrl(),
    hasProxyKey: Boolean(process.env.NS_GIFTS_PROXY_KEY),
    token: tokenData.result,
    results,
  });
}
