import { PreconditionFailedException } from "@nestjs/common";
import axios from 'axios';

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
 * Get a random element in array
 */
export function random(startNumber: number, nbPosibility: number) : number {
	return Math.floor(Math.random() * nbPosibility) + startNumber;
}

/**
 * Get a random element in array
 */
export function randomElement<T>(array: Array<T>) : T {
	return array[Math.floor(Math.random() * array.length)];
}

export function randomEnum<T>(enumeration: T) {
	const values = Object.keys(enumeration)
		.map(n => Number.parseInt(n))
		.filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
	return randomElement(values);
}

export function removesFromArray<T>(array: Array<T>, arrayToSubstract: Array<T>): Array<T> {
	const newArray: T[] = new Array();
	array.forEach(nb => {
		if (arrayToSubstract.indexOf(nb) === -1)
			newArray.push(nb);
	});
	return newArray;
}

export function removeFromArray<T>(array: Array<T>, key: T): Array<T> {
	const index = array.indexOf(key);
	if (index != -1)
		array.splice(index, 1);
	return array;
}

export async function toBase64(url: string) {
	let imageBase64: string;
	const response: any = await axios.get(url, {
		responseType: 'arraybuffer'
	});
	const header = response.headers['content-type'];
	const dataBase64 = Buffer.from(response.data, 'binary').toString('base64');
	// data:image/jpeg;base64,
	imageBase64 = `data:${header};base64,${dataBase64}`;

	return imageBase64;
}

export function fromBase64(imageBase64: string): { imageType: any; imageBuffer: any; } {
	const imgType: string = imageBase64.substring('data:'.length, imageBase64.indexOf(';'))
	const imgBase64: string = imageBase64.substring(imageBase64.indexOf(',') + 1, imageBase64.length)
	const imgRaw = Buffer.from(imgBase64, 'base64')
	return { imageType: imgType, imageBuffer : imgRaw };
}
