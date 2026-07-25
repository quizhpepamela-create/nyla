import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (client) return client;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey === "MY_STRIPE_SECRET_KEY") {
    return null;
  }
  client = new Stripe(secretKey);
  return client;
}

// Stripe amounts are in cents.
export function toStripeAmount(usd: number): number {
  return Math.round(usd * 100);
}
