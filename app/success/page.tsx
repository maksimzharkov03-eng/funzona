export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full bg-white/5 border border-yellow-400/20 rounded-3xl p-10 text-center">
        <div className="text-7xl mb-6">✅</div>

        <h1 className="text-5xl font-black text-yellow-400">
          Заказ создан
        </h1>

        <p className="text-gray-300 mt-6 text-lg">
          Спасибо за заказ! После подтверждения оплаты он появится в обработке.
        </p>

        <div className="mt-8 bg-black/60 rounded-2xl p-5 text-left">
          <p className="text-gray-400">Номер заказа:</p>
          <p className="text-2xl font-black">#FZ-1001</p>

          <p className="text-gray-400 mt-4">Статус:</p>
          <p className="text-yellow-400 font-black">Ожидает оплаты</p>
        </div>

        <a
          href="/"
          className="block mt-8 bg-yellow-400 text-black py-4 rounded-xl font-black"
        >
          На главную
        </a>
      </div>
    </main>
  );
}