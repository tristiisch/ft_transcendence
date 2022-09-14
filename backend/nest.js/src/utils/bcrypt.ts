import * as bcrypt from 'bcrypt';
import { isNumberPositive } from './utils';

let salt: any;
if (!Number.isNaN(process.env.BCRYPT_SALT_OR_ROUNDS))
	salt = Number.parseInt(process.env.BCRYPT_SALT_OR_ROUNDS);
else salt = process.env.BCRYPT_SALT_OR_ROUNDS;

export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
	if (!password) return false;
	return await bcrypt.compare(password, hash);
}
