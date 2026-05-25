import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const login = process.argv[2] || "admin";

try {
  const user = await prisma.user.update({
    where: { login },
    data: { role: "admin" },
  });

  console.log(`Готово: пользователь "${user.login}" теперь admin.`);
} catch (error) {
  console.error(`Не удалось назначить admin для "${login}". Проверь, что такой логин существует.`);
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
