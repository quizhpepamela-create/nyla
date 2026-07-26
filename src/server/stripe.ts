import Stripe from "stripe";
import https from "https";

let client: Stripe | null = null;

// Some hosts (Render's free tier included) have flaky/unreachable IPv6 routes, which makes
// Node's default dual-stack HTTPS agent intermittently fail to reach api.stripe.com with a
// generic "connection error, request was retried" — even though the same key works fine from
// anywhere else. Forcing the agent to only resolve/connect over IPv4 avoids that path entirely.
const ipv4Agent = new https.Agent({ family: 4, keepAlive: true });

export function getStripeClient(): Stripe | null {
  if (client) return client;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey === "MY_STRIPE_SECRET_KEY") {
    return null;
  }
  client = new Stripe(secretKey, {
    httpAgent: ipv4Agent,
    timeout: 20000,
    maxNetworkRetries: 2,
  });
  return client;
}

// Stripe amounts are in cents.
export function toStripeAmount(usd: number): number {
  return Math.round(usd * 100);
}
