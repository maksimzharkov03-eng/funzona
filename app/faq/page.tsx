import Link from "next/link";

export const metadata = {
  title: "FAQ FunZona",
  description: "Ответы на частые вопросы по заказам, оплате, PlayStation, подпискам и поддержке FunZona.",
};

const faqSections = [
  {
    title: "Заказы",
    items: [
      {
        question: "Как быстро выполняется заказ?",
        answer:
          "Обычно заказ выполняется от 5 до 30 минут после оплаты и проверки данных. В редких случаях, когда нужна ручная проверка или высокая нагрузка, срок может быть больше.",
      },
      {
        question: "Где посмотреть статус заказа?",
        answer:
          "После входа в аккаунт открой раздел Кабинет. Там видны только твои заказы и текущие статусы: ожидает оплаты, оплачен, в работе, выдан или отменен.",
      },
      {
        question: "Что писать в комментарии к заказу?",
        answer:
          "Укажи важные детали: регион аккаунта, нужный тариф, версию игры, логин PSN или Telegram для связи. Пароль лучше передавать только менеджеру в личном чате, если он действительно нужен для услуги.",
      },
    ],
  },
  {
    title: "PlayStation",
    items: [
      {
        question: "Какие регионы доступны для игр и подписок?",
        answer:
          "Сейчас на сайте добавлены Турция и Украина. Для игр цена подтягивается из PlayStation Store и пересчитывается в рубли по прайсу FunZona.",
      },
      {
        question: "Почему цена на сайте может отличаться от цены в PS Store?",
        answer:
          "В каталоге цена уже округляется и пересчитывается по нашему прайсу региона. Для Турции используется округление по лире, для Украины расчет идет по диапазонам гривны.",
      },
      {
        question: "Бесплатные игры добавляются в каталог?",
        answer:
          "Нет. Бесплатные позиции, демо, валюта, очки, DLC и наборы не добавляются в основной каталог игр.",
      },
      {
        question: "Можно ли купить игру для PS4 и PS5?",
        answer:
          "Да. В каталоге есть фильтры PS4 и PS5. Если игра поддерживает обе платформы, она отображается как PS4/PS5.",
      },
    ],
  },
  {
    title: "Подписки",
    items: [
      {
        question: "Какие подписки PlayStation есть на сайте?",
        answer:
          "В разделе подписок доступны Essential, Extra, Deluxe и EA Play для Турции и Украины. Цена уже указана в рублях.",
      },
      {
        question: "Можно ли выбрать срок подписки?",
        answer:
          "Да. Для тарифов доступны разные сроки: 1 месяц, 3 месяца и 12 месяцев, если такой вариант есть в прайсе.",
      },
    ],
  },
  {
    title: "Оплата",
    items: [
      {
        question: "Какие способы оплаты доступны?",
        answer:
          "На сайте предусмотрена оплата через доступные платежные способы. Если автоматическая оплата временно недоступна, менеджер подскажет актуальный вариант в Telegram.",
      },
      {
        question: "Что делать после оплаты?",
        answer:
          "Оформи заказ на сайте и дождись изменения статуса. Если нужна быстрая проверка, напиши менеджеру в Telegram и укажи номер заказа или логин аккаунта.",
      },
      {
        question: "Можно ли вернуть деньги?",
        answer:
          "Если заказ еще не выполнен, напиши в поддержку. После выдачи цифрового товара возврат зависит от конкретной ситуации и правил товара.",
      },
    ],
  },
  {
    title: "Аккаунт и поддержка",
    items: [
      {
        question: "Почему сайт пишет, что я не авторизован?",
        answer:
          "Проверь, что вход выполнен с того же браузера, где оформляешь заказ. Если проблема повторяется, выйди из аккаунта, зайди снова и напиши в поддержку.",
      },
      {
        question: "Как связаться с поддержкой?",
        answer:
          "Основная поддержка: Telegram @FunZona_manager. Также можно написать на почту Funzonapspsn@gmail.com.",
      },
      {
        question: "В какое время отвечает поддержка?",
        answer:
          "Обычно поддержка работает с 8:00 до 23:00 по МСК. Срочные вопросы по активным заказам лучше писать в Telegram.",
      },
    ],
  },
] as const;

const quickLinks = [
  { label: "Каталог", href: "/catalog" },
  { label: "Игры", href: "/games" },
  { label: "Подписки", href: "/subscriptions" },
  { label: "Поддержка", href: "/support" },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 py-10 sm:py-14 overflow-hidden">
      <section className="relative max-w-7xl mx-auto">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,#ffd40044,transparent_55%)] pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div>
            <div className="inline-flex w-fit border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 rounded-full px-5 py-2 text-sm font-black mb-6">
              FUNZONA FAQ
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-none">
              Частые вопросы
            </h1>

            <p className="text-gray-300 mt-5 max-w-3xl text-base sm:text-xl leading-8">
              Ответы по заказам, PlayStation Store, подпискам, оплате и работе поддержки.
            </p>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mt-8">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl border border-yellow-400/20 bg-white/5 px-5 py-3 text-center font-black hover:border-yellow-400 hover:text-yellow-400 transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <aside className="bg-white/5 border border-yellow-400/20 rounded-3xl p-6">
            <h2 className="text-2xl font-black text-yellow-400">Нужна помощь?</h2>
            <p className="text-gray-400 mt-4 leading-7">
              Если ответа нет в FAQ, напиши менеджеру. Быстрее всего отвечаем в Telegram.
            </p>
            <div className="mt-6 space-y-3 text-gray-300">
              <p className="font-black">Telegram: @FunZona_manager</p>
              <p className="font-black break-words">Email: Funzonapspsn@gmail.com</p>
            </div>
            <Link
              href="/support"
              className="mt-6 inline-flex w-full justify-center rounded-2xl bg-yellow-400 px-5 py-4 text-black font-black hover:bg-yellow-300 transition"
            >
              Открыть поддержку
            </Link>
          </aside>
        </div>

        <div className="relative z-10 mt-12 sm:mt-16 grid lg:grid-cols-2 gap-5">
          {faqSections.map((section) => (
            <section
              key={section.title}
              className="bg-white/5 border border-yellow-400/15 rounded-3xl p-4 sm:p-6"
            >
              <h2 className="text-2xl sm:text-3xl font-black text-yellow-400 mb-4">
                {section.title}
              </h2>

              <div className="space-y-3">
                {section.items.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-white/10 bg-black/50 p-5 open:border-yellow-400/40"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black text-base sm:text-lg">
                      <span>{item.question}</span>
                      <span className="shrink-0 text-yellow-400 transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 text-gray-400 leading-7">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
