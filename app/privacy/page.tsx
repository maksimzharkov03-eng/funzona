export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-14">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black text-yellow-400 mb-10">
          Политика конфиденциальности
        </h1>

        <div className="space-y-6 text-gray-300 leading-8">
          <p>
            FunZona уважает конфиденциальность пользователей и обеспечивает
            защиту персональных данных.
          </p>

          <p>
            При оформлении заказа мы можем собирать Telegram, email и данные,
            необходимые для обработки покупки и поддержки клиента.
          </p>

          <p>
            Все данные используются исключительно для обработки заказов,
            уведомлений и технической поддержки.
          </p>

          <p>
            Мы не передаем персональные данные третьим лицам.
          </p>

          <p>
            Используя сайт FunZona, вы соглашаетесь с данной политикой
            конфиденциальности.
          </p>
        </div>
      </div>
    </main>
  );
}