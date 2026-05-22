export default function SupportPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-black text-yellow-400 mb-4">
          Поддержка FunZona
        </h1>

        <p className="text-gray-400 mb-10">
          Ответы на частые вопросы по оплате и активации.
        </p>

        <div className="space-y-5">

          <div className="bg-white/5 border border-yellow-400/20 rounded-2xl p-6">
            <h2 className="text-2xl font-black">
              Как быстро выполняется заказ?
            </h2>

            <p className="text-gray-400 mt-3">
              Обычно от 5 до 30 минут после оплаты.
            </p>
          </div>

          <div className="bg-white/5 border border-yellow-400/20 rounded-2xl p-6">
            <h2 className="text-2xl font-black">
              Какая есть гарантия?
            </h2>

            <p className="text-gray-400 mt-3">
              Мы даем гарантию и поддержку по товарам.
            </p>
          </div>

          <div className="bg-white/5 border border-yellow-400/20 rounded-2xl p-6">
            <h2 className="text-2xl font-black">
              Какие способы оплаты?
            </h2>

            <p className="text-gray-400 mt-3">
              FreeKassa и криптовалюта.
            </p>
          </div>

        </div>

      </div>
    </main>
  )
}