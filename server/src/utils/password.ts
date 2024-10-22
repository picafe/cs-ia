import { hash, verify } from "@node-rs/argon2";
import {
  encodeBase32UpperCaseNoPadding,
} from "@oslojs/encoding";

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

export function generateRandomOTP(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const code = encodeBase32UpperCaseNoPadding(bytes);
  return code;
}

export async function verifyPasswordHash(
  hash: string,
  password: string,
): Promise<boolean> {
  return await verify(hash, password);
}

export function verifyPasswordStrength(password: string): boolean {
  return (
    password.length > 8 &&
    password.length < 255 &&
    /[0-9]/.test(password) &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[$&+,:;=?@#|'<>.^*()%!-]/.test(password)
  );
}

// export async function checkPasswordBreach(password: string): Promise<boolean> {
// 	const hash = encodeHexLowerCase(sha1(new TextEncoder().encode(password)));
// 	const hashPrefix = hash.slice(0, 5);
// 	const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`);
// 	const data = await response.text();
// 	const items = data.split("\n");
// 	for (const item of items) {
// 		const hashSuffix = item.slice(0, 35).toLowerCase();
// 		if (hash === hashPrefix + hashSuffix) {
// 			return false;
// 		}
// 	}
// 	return true;
// }
