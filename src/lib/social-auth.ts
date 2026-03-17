import { createCustomer, loginCustomer } from "./shopify-customer";

/**
 * Generate a deterministic password for social-login users.
 * The user never sees or types this password.
 */
async function generateSocialPassword(email: string, provider: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email + ":" + provider + ":stehlenauto_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return "Ss!" + hashHex.slice(0, 20);
}

/**
 * Create (if needed) and login a customer via Shopify Storefront API
 * using credentials derived from a social provider.
 */
export async function socialLoginToShopify(
  email: string,
  firstName: string,
  lastName: string,
  provider: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const socialPassword = await generateSocialPassword(email, provider);

  // Step 1: Try to create customer (will silently fail if already exists)
  await createCustomer({
    firstName,
    lastName,
    email,
    password: socialPassword,
  });

  // Step 2: Login to get access token
  const loginResult = await loginCustomer(email, socialPassword);

  if (loginResult.success && loginResult.token) {
    localStorage.setItem("loginProvider", provider);
    return { success: true, token: loginResult.token };
  }

  return { success: false, error: "Login failed. Please try again or use email/password." };
}
