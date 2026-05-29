import { NextResponse } from "next/server";
import { forbiddenJson, requireAdminUser } from "@/app/lib/server-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

function getBaseUrl() {
  return (process.env.NS_GIFTS_BASE_URL || "https://api.ns.gifts").replace(/\/$/, "");
}

function getHeaders(token?: string) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (process.env.NS_GIFTS_PROXY_KEY) {
    headers["x-proxy-key"] = process.env.NS_GIFTS_PROXY_KEY;
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 3500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await res.text();
    let json: unknown = null;

    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    return {
      ok: res.ok,
      status: res.status,
      durationMs: Date.now() - startedAt,
      json,
      text: text.slice(0, 700),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
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
      response: {
        ok: false,
        error: "Нет NS_GIFTS_LOGIN / NS_GIFTS_PASSWORD / NS_GIFTS_USER_ID",
      },
    };
  }

  const response = await fetchWithTimeout(
    `${getBaseUrl()}/api/v2/get_token`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        login,
        password,
        user_id: userId,
      }),
    },
    3500
  );

  const data = response.json as { token?: unknown } | null;

  return {
    token: typeof data?.token === "string" ? data.token : "",
    response,
  };
}

export async function GET(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) {
    return forbiddenJson();
  }

  const url = new URL(req.url);
  const endpoint = url.searchParams.get("endpoint") || "/api/v2/check_balance";
  const method = (url.searchParams.get("method") || "GET").toUpperCase() === "POST" ? "POST" : "GET";
  const startedAt = Date.now();

  const tokenData = await getToken();
  const checkBalance = await fetchWithTimeout(
    `${getBaseUrl()}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
    {
      method,
      headers: getHeaders(tokenData.token),
      body: method === "POST" ? JSON.stringify({}) : undefined,
    },
    3500
  );

  return NextResponse.json({
    baseUrl: getBaseUrl(),
    hasProxyKey: Boolean(process.env.NS_GIFTS_PROXY_KEY),
    endpoint,
    method,
    totalDurationMs: Date.now() - startedAt,
    token: {
      received: Boolean(tokenData.token),
      response: tokenData.response,
    },
    checkBalance,
    tryNext: [
      "/api/admin/ns-balance-debug?method=POST",
      "/api/admin/ns-balance-debug?endpoint=/api/v2/profile&method=GET",
      "/api/admin/ns-balance-debug?endpoint=/api/v2/user_info&method=GET",
    ],
  });
}
