import type User from '@/types/User';

export default interface Channel {
	name: string,
	type: string,
	avatar: string,
	users: User[],
	password: (string | null)
	admin: User[],
	owner: string,
	mute: User[],
	banned: User[]
}
