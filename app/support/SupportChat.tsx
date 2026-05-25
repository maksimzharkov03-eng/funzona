"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  sender: "user" | "admin";
  text: string;
  createdAt: string;
};

export default function SupportChat() {
  const [login, setLogin] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [orderRedirect, setOrderRedirect] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  async function loadMessages() {
    const res = await fetch("/api/chat", { cache: "no-store" });

    if (!res.ok) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const data = await res.json();
    setMessages(data);
    setLoading(false);
  }

  async function sendMessage() {
    const value = text.trim();
    if (!value || sending) return;

    setSending(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: value }),
    });

    setSending(false);

    if (!res.ok) {
      alert("Не удалось отправить сообщение");
      return;
    }

    setText("");
    loadMessages();
  }

  useEffect(() => {
    setOrderRedirect(new URLSearchParams(window.location.search).has("order"));

    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setLogin(data?.login || null);
        if (data?.login) loadMessages();
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!login) return;
    const timer = window.setInterval(loadMessages, 4000);
    return () => window.clearInterval(timer);
  }, [login]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  if (!login && !loading) {
    return (
      <section className="mb-10 rounded-3xl border border-yellow-400/20 bg-white/5 p-6 sm:p-8">
        <p className="text-sm font-black uppercase text-yellow-400">Онлайн-чат</p>
        <h2 className="mt-3 text-3xl font-black">Написать поддержке</h2>
        <p className="mt-3 max-w-2xl text-gray-400">
          Войди в аккаунт, чтобы открыть личный чат с поддержкой FunZona.
        </p>
        <a
          href="/login"
          className="mt-6 inline-flex rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black transition hover:opacity-90"
        >
          Войти в аккаунт
        </a>
      </section>
    );
  }

  return (
    <section className="mb-10 rounded-3xl border border-yellow-400/20 bg-white/5 p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-yellow-400">Онлайн-чат</p>
          <h2 className="text-3xl font-black">Поддержка FunZona</h2>
        </div>
        <p className="text-sm text-gray-400">Ответ появится прямо здесь.</p>
      </div>

      {orderRedirect ? (
        <div className="mb-4 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm font-black text-yellow-200">
          Заказ уже отправлен в этот чат. Админ видит состав заказа, сумму и твой комментарий.
        </div>
      ) : null}

      <div
        ref={listRef}
        className="h-[420px] overflow-y-auto rounded-3xl border border-white/10 bg-black p-4"
      >
        {loading ? (
          <p className="text-gray-400">Загружаем чат...</p>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <h3 className="text-2xl font-black text-yellow-400">Напиши первый вопрос</h3>
              <p className="mt-2 text-gray-400">Мы увидим его в админке и ответим здесь.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const own = message.sender === "user";

              return (
                <div
                  key={message.id}
                  className={"flex " + (own ? "justify-end" : "justify-start")}
                >
                  <div
                    className={
                      "max-w-[85%] rounded-3xl px-5 py-4 sm:max-w-[70%] " +
                      (own
                        ? "bg-yellow-400 text-black"
                        : "border border-yellow-400/20 bg-white/10 text-white")
                    }
                  >
                    <p className="whitespace-pre-wrap break-words font-semibold">
                      {message.text}
                    </p>
                    <p className={own ? "mt-2 text-xs text-black/60" : "mt-2 text-xs text-gray-500"}>
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Напиши сообщение..."
          className="min-h-[64px] flex-1 resize-none rounded-2xl border border-white/10 bg-black px-5 py-4 outline-none transition focus:border-yellow-400"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          className="rounded-2xl bg-yellow-400 px-7 py-4 font-black text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {sending ? "Отправка..." : "Отправить"}
        </button>
      </div>
    </section>
  );
}
