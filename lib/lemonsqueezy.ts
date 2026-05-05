import {
  lemonSqueezySetup,
  createCheckout,
  getStore,
} from "@lemonsqueezy/lemonsqueezy.js";
import { getSettings } from "./settings";

/**
 * Configure the LemonSqueezy SDK with the API key stored in admin settings.
 * Returns false if not configured yet.
 */
export async function ensureLemonSqueezyReady(): Promise<boolean> {
  const settings = await getSettings();
  if (!settings.lsApiKey) return false;
  lemonSqueezySetup({ apiKey: settings.lsApiKey });
  return true;
}

export async function lsHealthcheck() {
  const settings = await getSettings();
  if (!settings.lsApiKey || !settings.lsStoreId) {
    return { ok: false, message: "API key or Store ID missing." };
  }
  lemonSqueezySetup({ apiKey: settings.lsApiKey });
  try {
    const res = await getStore(settings.lsStoreId);
    if (res.error) {
      return { ok: false, message: res.error.message };
    }
    const name = res.data?.data?.attributes?.name ?? "(unknown)";
    return { ok: true, message: `Connected to store: ${name}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unknown error" };
  }
}

type CheckoutInput = {
  storeId: string;
  variantId: string;
  email?: string;
  name?: string;
  custom?: Record<string, string>;
  redirectUrl?: string;
  receiptThankYouNote?: string;
};

export async function createLemonCheckout(input: CheckoutInput) {
  const ok = await ensureLemonSqueezyReady();
  if (!ok) throw new Error("LemonSqueezy is not configured.");

  const res = await createCheckout(input.storeId, input.variantId, {
    checkoutData: {
      email: input.email,
      name: input.name,
      custom: input.custom,
    },
    productOptions: {
      receiptThankYouNote: input.receiptThankYouNote,
      redirectUrl: input.redirectUrl,
    },
    checkoutOptions: {
      embed: false,
      media: false,
      logo: true,
      desc: true,
    },
  });

  if (res.error) throw new Error(res.error.message);
  const url = res.data?.data?.attributes?.url;
  if (!url) throw new Error("No checkout URL returned.");
  return url;
}
