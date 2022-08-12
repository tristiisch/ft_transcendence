import Users from '@/data/users'
import Status from '@/types/ChannelStatus';

const users = [
	{
		name: 'Lord of the ring',
		type: Status.PUBLIC,
		avatar: 'https://avatarfiles.alphacoders.com/290/290739.jpg',
		users: [Users[1], Users[2]],
		password: null,
		admin: [Users[1], Users[2]],
		owner: 'nlaronch',
		mute: [Users[3]],
		banned: [Users[4]]
	},
	{
		name: 'tsv',
		type: Status.PROTECTED,
		avatar: '@/assets/obama.jpeg',
		users: [Users[1], Users[2]],
		password: 'krondor',
		admin: [Users[1], Users[2]],
		owner: 'Gandalf',
		mute: [Users[3]],
		banned: [Users[4]]
	}
];

export default users;