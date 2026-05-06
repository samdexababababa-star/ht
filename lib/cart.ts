import { cookies } from "next/headers";

const CART_COOKIE = "salma_cart";

export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export async function getCart(): Promise<CartItem[]> {
  const jar = await cookies();
  const raw = jar.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        typeof i?.productId === "string" && typeof i?.quantity === "number",
    );
  } catch {
    return [];
  }
}

export async function setCart(items: CartItem[]) {
  const jar = await cookies();
  jar.set(CART_COOKIE, JSON.stringify(items), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCart() {
  const jar = await cookies();
  jar.delete(CART_COOKIE);
}

export async function addToCart(item: CartItem) {
  const cart = await getCart();
  const idx = cart.findIndex(
    (i) => i.productId === item.productId && i.variantId === item.variantId,
  );
  if (idx >= 0) {
    cart[idx].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  await setCart(cart);
  return cart;
}

export async function removeFromCart(productId: string, variantId?: string) {
  const cart = await getCart();
  const next = cart.filter(
    (i) => !(i.productId === productId && i.variantId === variantId),
  );
  await setCart(next);
  return next;
}
