import Users from '@/data/users'
import Status from '@/types/ChannelStatus';

const users = [
	{
		name: 'Lord of the ring',
		type: Status.PUBLIC,
		avatar: 'https://avatarfiles.alphacoders.com/290/290739.jpg',
		users: Users,
		password: null,
		admin: Users,
		owner: 'nlaronch',
		mute: [Users[3]],
		banned: [Users[4]]
	},
	{
		name: 'TSV',
		type: Status.PROTECTED,
		avatar: 'https://avatarfiles.alphacoders.com/290/290739.jpg',
		users: Users,
		password: null,
		admin: Users,
		owner: 'nlaronch',
		mute: [Users[3]],
		banned: [Users[4]]
	},
	{
		name: '42',
		type: Status.PRIVATE,
		avatar: 'https://avatarfiles.alphacoders.com/290/290739.jpg',
		users: Users,
		password: null,
		admin: Users,
		owner: 'nlaronch',
		mute: [Users[3]],
		banned: [Users[4]]
	}
];

export default users;