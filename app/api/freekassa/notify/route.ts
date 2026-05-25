import crypto from "node:crypto";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

function md5(value: string) {
  return crypto.createHash("md5").update(value).digest("hex");
}

function priceToNumber(price: string) {
  return Number(String(price).replace(/\D/g, "")) || 0;
}

function text(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

export async function POST(req: Request) {
  const form = await req.formData();

  const merchantId = text(form.get("MERCHANT_ID"));
  const amount = text(form.get("AMOUNT"));
  const orderId = text(form.get("MERCHANT_ORDER_ID"));
  const sign = text(form.get("SIGN")).toLowerCase();
  const expectedMerchantId = process.env.FREEKASSA_MERCHANT_ID || "";
  const secret2 = process.env.FREEKASSA_SECRET_2 || "";

  if (!expectedMerchantId || !secret2) {
    return new NextResponse("NO SETTINGS", { status: 500 });
  }

  if (merchantId !== expectedMerchantId) {
    return new NextResponse("WRONG MERCHANT", { status: 400 });
  }

  const expectedSign = md5(
    merchantId + ":" + amount + ":" + secret2 + ":" + orderId
  ).toLowerCase();

  if (sign !== expectedSign) {
    return new NextResponse("WRONG SIGN", { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
  });

  if (!order) {
    return new NextResponse("ORDER NOT FOUND", { status: 404 });
  }

  const expectedAmount = priceToNumber(order.productPrice);
  const paidAmount = Math.round(Number(amount) * 100);

  if (Math.round(expectedAmount * 100) !== paidAmount) {
    return new NextResponse("WRONG AMOUNT", { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "Оплачен" },
  });

  if (updated.userLogin && order.status !== "Оплачен") {
    await prisma.chatMessage.create({
      data: {
        userLogin: updated.userLogin,
        sender: "admin",
        text:
          "Оплата по заказу #" +
          updated.id +
          " получена. Заказ передан в работу.",
        readByAdmin: true,
        readByUser: false,
      },
    });
  }

  return new NextResponse("YES", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET() {
  return new NextResponse("FreeKassa notify endpoint", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
