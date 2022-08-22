import type User from '@/types/User';
import type status from '@/types/ChannelStatus';

export default interface Channel {
	name: string,
	type: status,
	avatar: string,
	users: User[],
	password: (string | null)
	admin: User[],
	owner: string,
	mute: User[],
	banned: User[]
}