import { accessCredentials, passSecret } from "./credentials";
import { passExpiry } from "./token";

/**
 * When the given pass ends, or null when it does not open the site. The one
 * place that ties a cookie value to the configured credentials, shared by the
 * proxy, the preview layout and the access page.
 */
export async function validPassExpiry(pass: string | undefined): Promise<number | null> {
  const credentials = accessCredentials();
  if (!credentials) return null;
  return passExpiry(pass, passSecret(credentials));
}
