import { digest, safeEqual } from "./token";

export type AccessCredentials = { user: string; password: string };

/**
 * The new site opens with the USER and PASSWORD set in the deploy's
 * environment. When either is missing, nobody can sign in.
 *
 * Note for local runs: shells set USER to your login name, and Next does not
 * let a .env file override a variable the shell already set. Start the dev
 * server with USER=... PASSWORD=... npm run dev to choose your own.
 */
export function accessCredentials(): AccessCredentials | null {
  const user = process.env.USER;
  const password = process.env.PASSWORD;
  if (!user || !password) return null;
  return { user, password };
}

/**
 * The secret that signs passes. It comes from both values, so changing the
 * user or the password signs everyone out at once.
 */
export function passSecret({ user, password }: AccessCredentials): string {
  return `coere-access\u0000${user}\u0000${password}`;
}

/**
 * Checks a sign in attempt. Both fields are digested and both are compared
 * every time, so a wrong user and a wrong password take the same time.
 */
export async function credentialsMatch(
  expected: AccessCredentials,
  user: string,
  password: string,
): Promise<boolean> {
  const [userOk, passwordOk] = await Promise.all([
    digest(user).then(async (d) => safeEqual(d, await digest(expected.user))),
    digest(password).then(async (d) => safeEqual(d, await digest(expected.password))),
  ]);
  return userOk && passwordOk;
}
