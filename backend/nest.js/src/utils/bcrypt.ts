import * as bcrypt from 'bcrypt';

const salt: number = Number.parseInt(process.env.BCRYPT_SALT_OR_ROUNDS);

export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
	return await bcrypt.compare(password, hash);
}
