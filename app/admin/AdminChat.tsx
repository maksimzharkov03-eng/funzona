"use client";

import { useEffect, useRef, useState } from "react";

type Conversation = {
  userLogin: string;
  lastText: string;
  lastSender: string;
  lastAt: string;
  unread: number;
};

type Message = {
  id: number;
  userLogin: string;
  sender: "user" | "admin" | "system";
  text: string;
  createdAt: string;
};

export default function AdminChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedLogin, setSelectedLogin] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  async function loadConversations() {
    const res = await fetch("/api/chat?mode=conversations", { cache: "no-store" });
    if (!res.ok) return;

    const data = await res.json();
    setConversations(data);

    if (!selectedLogin && data[0]?.userLogin) {
      setSelectedLogin(data[0].userLogin);
    }
  }

  async function loadMessages(login = selectedLogin) {
    if (!login) return;

    const res = await fetch("/api/chat?userLogin=" + encodeURIComponent(login), {
      cache: "no-store",
    });

    if (!res.ok) return;

    const data = await res.json();
    setMessages(data);
    loadConversations();
  }

  async function sendMessage() {
    const value = text.trim();
    if (!value || !selectedLogin || sending) return;

    setSending(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userLogin: selectedLogin,
        text: value,
      }),
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
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedLogin) return;
    loadMessages(selectedLogin);
  }, [selectedLogin]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadConversations();
      if (selectedLogin) loadMessages(selectedLogin);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [selectedLogin]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, selectedLogin]);

  return (
    <section className="mb-10 rounded-3xl border border-yellow-400/20 bg-white/5 p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-yellow-400">Диалоги</p>
          <h2 className="text-3xl font-black">Чат с клиентами</h2>
        </div>
        <p className="text-sm text-gray-400">Сообщения обновляются автоматически.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-black p-3">
          {conversations.length === 0 ? (
            <div className="p-5 text-gray-400">Диалогов пока нет</div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const active = conversation.userLogin === selectedLogin;

                return (
                  <button
                    key={conversation.userLogin}
                    type="button"
                    onClick={() => setSelectedLogin(conversation.userLogin)}
                    className={
                      "w-full rounded-2xl border p-4 text-left transition " +
                      (active
                        ? "border-yellow-400 bg-yellow-400 text-black"
                        : "border-white/10 bg-white/5 hover:border-yellow-400/60")
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black">{conversation.userLogin}</p>
                      {conversation.unread > 0 ? (
                        <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-black text-white">
                          {conversation.unread}
                        </span>
                      ) : null}
                    </div>
                    <p className={active ? "mt-2 line-clamp-2 text-sm text-black/70" : "mt-2 line-clamp-2 text-sm text-gray-400"}>
                      {conversation.lastSender === "admin"
                        ? "Вы: "
                        : conversation.lastSender === "system"
                          ? "Система: "
                          : "Клиент: "}
                      {conversation.lastText}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <div className="rounded-3xl border border-white/10 bg-black p-4">
          <div
            ref={listRef}
            className="h-[460px] overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.03] p-4"
          >
            {!selectedLogin ? (
              <div className="flex h-full items-center justify-center text-center text-gray-400">
                Выбери диалог клиента слева.
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-gray-400">
                Сообщений пока нет.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const own = message.sender === "admin";
                  const system = message.sender === "system";

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
                            : system
                              ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                              : "border border-white/10 bg-white/10 text-white")
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
              placeholder={selectedLogin ? "Ответ клиенту..." : "Сначала выбери клиента"}
              disabled={!selectedLogin}
              className="min-h-[64px] flex-1 resize-none rounded-2xl border border-white/10 bg-black px-5 py-4 outline-none transition focus:border-yellow-400 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!selectedLogin || !text.trim() || sending}
              className="rounded-2xl bg-yellow-400 px-7 py-4 font-black text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {sending ? "Отправка..." : "Ответить"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
