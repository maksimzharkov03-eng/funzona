import { forbiddenJson, requireAdminUser } from "@/app/lib/server-auth";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  {
  const admin = await requireAdminUser();

  if (!admin) {
    return forbiddenJson();
  }
 params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const orderId = Number(id);

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: "Заказ не найден" },
        { status: 404 }
      );
    }

    const data: any = {};

    if (typeof body.status === "string") {
      data.status = body.status;
    }

    if (typeof body.deliveryData === "string") {
      data.deliveryData = body.deliveryData.trim();
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data,
    });

    if (order.userLogin) {
      const messages: string[] = [];

      if (typeof body.status === "string" && body.status !== currentOrder.status) {
        messages.push("Статус заказа #" + order.id + " изменен: " + body.status + ".");
      }

      if (
        typeof body.deliveryData === "string" &&
        body.deliveryData.trim() &&
        body.deliveryData.trim() !== (currentOrder.deliveryData || "")
      ) {
        messages.push(
          "Данные выдачи по заказу #" +
            order.id +
            " добавлены. Открой личный кабинет, чтобы посмотреть заказ."
        );
      }

      for (const text of messages) {
        await prisma.chatMessage.create({
          data: {
            userLogin: order.userLogin,
            sender: "admin",
            text,
            readByAdmin: true,
            readByUser: false,
          },
        });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка обновления заказа" },
      { status: 500 }
    );
  }
}
