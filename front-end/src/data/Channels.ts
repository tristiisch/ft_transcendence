import Users from '@/data/users'
import Status from '@/types/ChannelStatus';

const channels = [
	{
		name: 'Lord of the ring',
		type: Status.PUBLIC,
		avatar: 'https://images-eu.ssl-images-amazon.com/images/I/51bU7pLNYBL._SX218_BO1,204,203,200_QL40_ML2_.jpg',
		users: Users,
		password: null,
		admin: Users,
		owner: 'Borormir',
		mute: [Users[3]],
		banned: [Users[4]],
		messages: [{
								date: 'Sep 5, 2018 12:32:27',
								message: 'hi',
								id:1
							},
{
								date: 'Sep 5, 2018 12:33:27',
								message: 'hello',
								id:2
							},
							{
								date: 'Sep 5, 2018 12:33:27',
								message: 'hi!',
								id:3
							},
							{
								date: 'Sep 5, 2018 12:34:27',
								message: 'bonjour',
								id:4
							},
							{
								date: 'Sep 5, 2018 12:35:27',
								message: 'konichuha',
								id:5
							},
							{
								date: 'Sep 5, 2018 12:36:27',
								message: 'hellllo',
								id:6
							}]
	},
	{
		name: 'TSV',
		type: Status.PROTECTED,
		avatar: null,
		users: Users,
		password: 'password',
		admin: Users,
		owner: 'jlaronch',
		mute: [Users[3]],
		banned: [Users[4]],
		messages: [{
								date: 'Sep 5, 2018 12:32:27',
								message: 'what is your favorite color',
								id:4
							},
							{
								date: 'Sep 5, 2018 12:33:27',
								message: 'red i guess?',
								id:5
							},
							{
								date: 'Sep 5, 2018 12:34:27',
								message: 'thks',
								id:4
							},
							{
								date: 'Sep 5, 2018 12:35:27',
								message: 'why you ask?',
								id:5
							}]
	},
	{
		name: '42',
		type: Status.PRIVATE,
		avatar: 'https://experience.42lyon.fr/static/images/logos/42/logo_42_white.png',
		users: Users,
		password: null,
		admin: [Users[1], Users[2]],
		owner: 'Gandalf',
		mute: [Users[3]],
		banned: [Users[4]],
		messages: [{
								date: 'Sep 5, 2018 12:32:27',
								message: 'how are you?',
								id:2
							},
							{
								date: 'Sep 5, 2018 12:33:27',
								message: 'fine and you?',
								id:3
							},
							{
								date: 'Sep 5, 2018 12:34:27',
								message: 'i am ok. where are you now?',
								id:2
							},
							{
								date: 'Sep 5, 2018 12:35:27',
								message: 'i am at Nice now',
								id:3
							}]
	}
];

export default channels;
