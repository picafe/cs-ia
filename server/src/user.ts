import { prisma } from "./db";
import { hashPassword } from "./password";

export async function createUser(email: string, name: string, password: string): Promise<User> {
	const passwordHash = await hashPassword(password);
	const usr = await prisma.user.create({
		data: {
			email: email,
			name: name,
			password_hash: passwordHash
		},
		
	})
	
	
	const user: User = {
		id: usr.id,
		name,
		email,
	};
	return user;
}

export async function updateUserPassword(userId: number, password: string): Promise<void> {
	const passwordHash = await hashPassword(password);
	await prisma.user.update({
		where: {id: userId},
		data: {
			password_hash: passwordHash,
		}
	})
}

export async function updateUserEmailAndSetEmailAsVerified(userId: number, email: string): Promise<void> {
	await prisma.user.update({
		where: {id: userId},
		data: {
			email: email,
		}
	})
}

// export function getUserPasswordHash(userId: number): string {
// 	const row = db.queryOne("SELECT password_hash FROM user WHERE id = ?", [userId]);
// 	if (row === null) {
// 		throw new Error("Invalid user ID");
// 	}
// 	return row.string(0);
// }

// export function getUserFromEmail(email: string): User | null {
// 	const row = db.queryOne(
// 		"SELECT id, email, username, email_verified, IIF(totp_key IS NOT NULL, 1, 0) FROM user WHERE email = ?",
// 		[email]
// 	);
// 	if (row === null) {
// 		return null;
// 	}
// 	const user: User = {
// 		id: row.number(0),
// 		email: row.string(1),
// 		username: row.string(2),
// 	};
// 	return user;
// }

export interface User {
	id: number;
	email: string;
	name: string;
}