// Signs in a sales-app user from headers the sales app signs with BRAIN_SHARED_SECRET, so each user gets their own memory.
import { createHmac, timingSafeEqual } from "node:crypto";
import type { AuthFn } from "eve/channels/auth";

export function appUserAuth(): AuthFn<Request> {
  return async (request) => {
    const secret = process.env.BRAIN_SHARED_SECRET;
    const userId = request.headers.get("x-app-user-id");
    const sig = request.headers.get("x-app-user-sig");
    if (!secret || !userId || !sig) return null;

    // Accepts the user ID only when the signature matches the shared secret.
    const good = createHmac("sha256", secret).update(userId).digest("base64url");
    if (good.length !== sig.length || !timingSafeEqual(Buffer.from(good), Buffer.from(sig))) return null;

    return {
      authenticator: "sales-app",
      issuer: "sales-analyst-agent",
      principalId: userId,
      principalType: "user",
      subject: userId,
      attributes: {},
    };
  };
}