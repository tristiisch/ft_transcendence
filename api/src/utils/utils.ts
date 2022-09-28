import { Logger, PreconditionFailedException, Req } from "@nestjs/common";
import axios from 'axios';
import { validate } from "class-validator";

export function isEquals(entity1: any, entity2: any) : boolean {
	if (!entity1 && !entity2)
		return true;
	if (!entity1 || !entity2)
		return false;
	const userFieldsNames1: string[] = Object.keys(entity1)
	const userFieldsNames2: string[] = Object.keys(entity2)

	if (userFieldsNames1.length != userFieldsNames2.length)
		return false;

	// Loop of every fields of type entity1
	for (let field of userFieldsNames1) {
		if (!entity1[field] && !entity2[field])
			continue;
		if (!entity1[field] || !entity2[field])
			return false;
		if (entity1[field] !== entity2[field])
			return false;
	}
	return true;
}

/**
 * @throws {PreconditionFailedException} If {@link nb} is negative or not a number
 */
export function isNumberPositive(nb: number, actionMsg: string): boolean {
	if (Number.isNaN(nb))
		throw new PreconditionFailedException(`Can't ${actionMsg} with a non-numeric variable.`);
	else if (nb < 0)
		throw new PreconditionFailedException(`Can't ${actionMsg} with negative number ${nb}.`);
	return true;
}

/**
 * Get a random number
 */
export function randomNumber(startNumber: number, nbPosibility: number) : number {
	return Math.floor(Math.random() * nbPosibility) + startNumber;
}

export function randomWord(length: number) {
	const dico: string = "abcdefghijklmnopqrstuvwxyz0123456789";
	return Array(length).join().split(',').map(function() { return dico.charAt(Math.floor(Math.random() * dico.length)); }).join('');
}

/**
 * Get a random element in array
 */
export function randomElement<T>(array: Array<T>) : T {
	return array[Math.floor(Math.random() * array.length)];
}

export function randomElements<T>(array: Array<T>, nbElements: number) : T[] {
	const shuffled = array.sort(() => 0.5 - Math.random());
	return shuffled.slice(0, nbElements);
}

export function randomEnum<T>(enumeration: T) {
	const values = Object.keys(enumeration)
		.map(n => Number.parseInt(n))
		.filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
	return randomElement(values);
}

export function removesFromArray<T>(array: Array<T>, arrayToSubstract: Array<T>): Array<T> {
	if (!array)
		return undefined;
	if (!arrayToSubstract)
		return array;
	return array.filter(o => arrayToSubstract.indexOf(o) === -1);
}

export function removeFromArray<T>(array: Array<T>, key: T): Array<T> {
	if (!array)
		return undefined;
	const index = array.indexOf(key);
	if (index != -1)
		array.splice(index, 1);
	return array;
}

export async function toBase64(url: string): Promise<string | null> {
	try {
		let imageBase64: string;
		const response: any = await axios.get(url, {
			responseType: 'arraybuffer'
		});
		const header = response.headers['content-type'];
		const dataBase64 = Buffer.from(response.data, 'binary').toString('base64');
		// data:image/jpeg;base64,
		imageBase64 = `data:${header};base64,${dataBase64}`;
		return imageBase64;
	} catch (err) {
		Logger.error(`Exception when download URL ${url} : ${err.message}.`, 'UserAvatar');
	}
	return null;
}

export function fromBase64(imageBase64: string): { imageType: any; imageBuffer: any; } | null {
	if (imageBase64 == null || !imageBase64.startsWith('data:'))
		return null;
	const imgType: string = imageBase64.substring('data:'.length, imageBase64.indexOf(';'))
	if (imgType == null || imgType == '')
		return null;
	const imgBase64: string = imageBase64.substring(imageBase64.indexOf(',') + 1, imageBase64.length)
	if (imgBase64 == null || imgBase64 == '')
		return null;
	try {
		const imgRaw = Buffer.from(imgBase64, 'base64')
		return { imageType: imgType, imageBuffer : imgRaw };
	} catch (err) {
		Logger.error(`Exception when extract from base64 ${imageBase64} : ${err.message}.`, 'UserAvatar');
	}
	return null;
}

export async function validateDTOforHttp<T extends Object>(dto: T) {
	return await validate(dto).then(errors => {
		if (errors.length > 0) {
			const messageJoiner: string[] = new Array();
			for (let validator of errors) {
				for (let key in validator.constraints) {
					messageJoiner.push(validator.constraints[key]);
				}
			}
			throw new PreconditionFailedException(`${messageJoiner.join(', ')}`);
		}
	});
}

export function getBackRelativeURL(req: any) {
	return `${req.headers['x-forwarded-proto'] ?? req.protocol}://${req.headers.host}`
}

export function getFrontRelativeURL(req: any) {
	return `${req.headers['x-forwarded-proto'] ?? req.protocol}://${req.headers.host.split(':')[0]}:${process.env.FRONT_PORT}`
}

// export function mapGetByValue<K, V>(map: Map<K, V>, value: V): K {
// 	const v: V = [...map].find(([key, val]) => val == value);
// 	if (v && v.length)
// 		return v[0]
// }
