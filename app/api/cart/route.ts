import { NextRequest, NextResponse } from "next/server";
import { addToCart, getCart, removeFromCart, setCart } from "@/lib/cart";
import { z } from "zod";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("add"),
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().min(1).default(1),
  }),
  z.object({
    action: z.literal("remove"),
    productId: z.string(),
    variantId: z.string().optional(),
  }),
  z.object({
    action: z.literal("update"),
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().min(0),
  }),
  z.object({
    action: z.literal("set"),
    items: z.array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1),
      }),
    ),
  }),
  z.object({ action: z.literal("clear") }),
]);

export async function GET() {
  return NextResponse.json({ cart: await getCart() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid input." }, { status: 400 });
  }
  const data = parsed.data;
  switch (data.action) {
    case "add":
      await addToCart({
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
      });
      break;
    case "remove":
      await removeFromCart(data.productId, data.variantId);
      break;
    case "update": {
      const cart = await getCart();
      const next = cart
        .map((i) =>
          i.productId === data.productId && i.variantId === data.variantId
            ? { ...i, quantity: data.quantity }
            : i,
        )
        .filter((i) => i.quantity > 0);
      await setCart(next);
      break;
    }
    case "set":
      await setCart(data.items);
      break;
    case "clear":
      await setCart([]);
      break;
  }
  return NextResponse.json({ ok: true, cart: await getCart() });
}
