import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, process.env.BCRYPT_SALT_OR_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
	return await bcrypt.compare(password, hash);
}
