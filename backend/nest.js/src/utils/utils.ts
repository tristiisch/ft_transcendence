import { PreconditionFailedException } from "@nestjs/common";

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
export function isNumberPositive(nb: number, actionMsg: string) {
	if (Number.isNaN(nb))
		throw new PreconditionFailedException(`Can't ${actionMsg} with a non-numeric variable.`);
	else if (nb < 0)
		throw new PreconditionFailedException(`Can't ${actionMsg} with negative number ${nb}.`);
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

export function removeFromArray<T>(array: Array<T>, key: T): Array<T> {
	const index = array.indexOf(key, 0);
	if (index > -1)
		array.splice(index, 1);
	return array;
}
