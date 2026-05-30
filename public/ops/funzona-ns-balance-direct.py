#!/usr/bin/env python3
import base64
import hashlib
import hmac
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

ENV_PATH = Path("/etc/funzona-ns-balance.env")
STATE_PATH = Path("/var/lib/funzona-ns-balance/state.json")
LOG_PATH = Path("/var/log/funzona-ns-balance-direct.log")


def load_env():
    data = {}
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            data[key.strip()] = value.strip().strip('"').strip("'")
    return data


def log(message):
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as file:
        file.write(time.strftime("%Y-%m-%d %H:%M:%S") + " " + message + "\n")


def json_bytes(value):
    if value is None:
        return b""
    return json.dumps(value, separators=(",", ":")).encode("utf-8")


def request_json(url, method="GET", body=None, headers=None, timeout=30):
    headers = dict(headers or {})
    headers["Accept"] = "application/json"
    payload = json_bytes(body)
    if body is not None:
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=payload if body is not None else None, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            text = response.read().decode("utf-8", "replace")
            return response.status, json.loads(text) if text else {}
    except urllib.error.HTTPError as error:
        text = error.read().decode("utf-8", "replace")
        try:
            return error.code, json.loads(text) if text else {}
        except Exception:
            return error.code, {"raw": text}


def signature(api_secret, method, path, body, timestamp, token=None):
    body_hash = hashlib.sha256(body or b"").hexdigest()
    parts = [method.upper(), path, "", timestamp]
    if token is not None:
        parts.append(token)
    parts.append(body_hash)
    string_to_sign = "\n".join(parts).encode("utf-8")
    digest = hmac.new(base64.b64decode(api_secret), string_to_sign, hashlib.sha256).digest()
    return base64.b64encode(digest).decode("utf-8")


def signed_headers(env, method, path, body, token=None):
    timestamp = str(int(time.time()))
    headers = {
        "X-User-Id": str(env["NS_GIFTS_USER_ID"]),
        "X-Timestamp": timestamp,
        "X-Signature": signature(env["NS_GIFTS_API_SECRET"], method, path, body, timestamp, token),
    }
    if token is not None:
        headers["X-Token"] = token
    if env.get("NS_GIFTS_PROXY_KEY"):
        headers["x-funzona-proxy-key"] = env["NS_GIFTS_PROXY_KEY"]
    return headers


def find_balance(value):
    if isinstance(value, dict):
        for key, nested in value.items():
            if "balance" in key.lower() or "wallet" in key.lower():
                try:
                    return float(str(nested).replace(",", "."))
                except Exception:
                    pass
            found = find_balance(nested)
            if found is not None:
                return found
    if isinstance(value, list):
        for nested in value:
            found = find_balance(nested)
            if found is not None:
                return found
    return None


def load_state():
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_state(state):
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def telegram(env, text):
    token = env.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = env.get("TELEGRAM_CHAT_ID", "")
    if not token or not chat_id:
        log("Telegram settings are missing")
        return
    status, _ = request_json(
        "https://api.telegram.org/bot" + token + "/sendMessage",
        method="POST",
        body={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
    )
    log("telegram status=" + str(status))


def login(env, base):
    path = "/api/v2/get_token"
    body = {"login": env["NS_GIFTS_LOGIN"], "password": env["NS_GIFTS_PASSWORD"]}
    payload = json_bytes(body)
    status, token_data = request_json(
        base + path,
        method="POST",
        body=body,
        headers=signed_headers(env, "POST", path, payload),
    )
    log("get_token status=" + str(status))
    token = token_data.get("token") if isinstance(token_data, dict) else None
    if not token:
        raise RuntimeError("get_token failed: " + json.dumps(token_data, ensure_ascii=False)[:500])
    return token


def main():
    env = load_env()
    required = [
        "NS_GIFTS_USER_ID",
        "NS_GIFTS_LOGIN",
        "NS_GIFTS_PASSWORD",
        "NS_GIFTS_API_SECRET",
    ]
    missing = [key for key in required if not env.get(key)]
    if missing:
        raise RuntimeError("missing settings: " + ", ".join(missing))

    base = env.get("NS_GIFTS_BASE_URL", "http://127.0.0.1:8787").rstrip("/")
    token = login(env, base)
    path = "/api/v2/check_balance"
    status, data = request_json(
        base + path,
        method="GET",
        headers=signed_headers(env, "GET", path, b"", token),
    )
    balance = find_balance(data)
    log("check_balance method=GET status=" + str(status) + " balance=" + str(balance))
    if balance is None:
        raise RuntimeError("balance not found: " + json.dumps(data, ensure_ascii=False)[:800])

    state = load_state()
    state["last_balance"] = balance
    state["last_balance_at"] = int(time.time())
    state["last_error_count"] = 0
    limit = float(env.get("NS_GIFTS_LOW_BALANCE", "50"))
    last_alert = int(state.get("last_low_alert", 0) or 0)
    if balance <= limit and time.time() - last_alert > 21600:
        telegram(env, "⚠️ <b>FunZona: низкий баланс NS Gifts</b>\n\nТекущий баланс: <b>$%.2f</b>\nПорог: <b>$%.2f</b>\n\nНужно пополнить NS Gifts." % (balance, limit))
        state["last_low_alert"] = int(time.time())
    save_state(state)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        log("ERROR " + str(error))
        state = load_state()
        count = int(state.get("last_error_count", 0) or 0) + 1
        state["last_error_count"] = count
        state["last_error"] = str(error)[:800]
        state["last_error_at"] = int(time.time())
        save_state(state)
        if count == 3:
            try:
                telegram(load_env(), "⚠️ <b>FunZona: баланс NS Gifts не проверяется</b>\n\nОшибка повторилась 3 раза подряд. Проверь VPS и NS Gifts API.")
            except Exception as tg_error:
                log("telegram ERROR " + str(tg_error))
