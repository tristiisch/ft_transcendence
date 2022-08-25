import Users from '@/data/users'
import Status from '@/types/ChatStatus';
import type Channel from '@/types/Channel';

const channels: Channel[] = [
	{
		id: 1,
		name: 'Lord of the ring',
		type: Status.PUBLIC,
		avatar: 'https://images-eu.ssl-images-amazon.com/images/I/51bU7pLNYBL._SX218_BO1,204,203,200_QL40_ML2_.jpg',
		users: Users,
		password: null,
		admin: Users,
		owner: Users[2],
		mute: [Users[3]],
		banned: [Users[4]],
		messages: [{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:32:27',
								message: 'hi',
								idSender: 1
							},
							{	
								idMessage: 2,
								idChat: 1,
								date: 'Sep 5, 2018 12:33:17',
								message: 'hello',
								idSender: 2
							},
							{
								idMessage: 3,
								idChat: 1,
								date: 'Sep 5, 2018 12:33:27',
								message: 'hi!',
								idSender: 3
							},
							{
								idMessage: 4,
								idChat: 1,
								date: 'Sep 5, 2018 12:34:27',
								message: 'bonjour',
								idSender: 4
							},
							{
								idMessage: 5,
								idChat: 1,
								date: 'Sep 5, 2018 12:35:27',
								message: 'konichuha',
								idSender: 5
							},
							{
								idMessage: 6,
								idChat: 1,
								date: 'Sep 5, 2018 12:36:27',
								message: 'hellllo',
								idSender: 6
							}]
	},
	{
		id: 2,
		name: 'TSV',
		type: Status.PROTECTED,
		avatar: 'src/assets/ChannelDefaultProtected.png',
		users: [Users[0], Users[3], Users[4], Users[5]],
		password: 'password',
		admin: [Users[5], Users[3], Users[4]],
		owner: Users[3],
		mute: [Users[3]],
		banned: [Users[1]],
		messages: [{
								idMessage: 1,
								idChat: 2,
								date: 'Sep 5, 2018 12:32:27',
								message: 'what is your favorite color',
								idSender:4
							},
							{
								idMessage: 2,
								idChat: 2,
								date: 'Sep 5, 2018 12:33:27',
								message: 'red i guess?',
								idSender:5
							},
							{
								idMessage: 3,
								idChat: 2,
								date: 'Sep 5, 2018 12:34:27',
								message: 'thks',
								idSender:4
							},
							{
								idMessage: 4,
								idChat: 2,
								date: 'Sep 5, 2018 12:35:27',
								message: 'why you ask?',
								idSender:5
							}]
	},
	{
		id:3,
		name: '42',
		type: Status.PRIVATE,
		avatar: 'https://experience.42lyon.fr/static/images/logos/42/logo_42_white.png',
		users: Users,
		password: null,
		admin: [Users[1], Users[2]],
		owner: Users[1],
		mute: [Users[3]],
		banned: [Users[4]],
		messages: [{
								idMessage: 1,
								idChat: 3,
								date: 'Sep 5, 2018 12:32:27',
								message: 'how are you?',
								idSender:2
							},
							{
								idMessage: 2,
								idChat: 3,
								date: 'Sep 5, 2018 12:33:27',
								message: 'fine and you?',
								idSender:3
							},
							{
								idMessage: 3,
								idChat: 3,
								date: 'Sep 5, 2018 12:34:27',
								message: 'i am ok. where are you now?',
								idSender:2
							},
							{
								idMessage: 4,
								idChat: 3,
								date: 'Sep 5, 2018 12:35:27',
								message: 'i am at Nice now',
								idSender:3
							}]
	},
	{
		id: 4,
		name: 'MTG',
		type: Status.PRIVATE,
		avatar: 'src/assets/ChannelDefaultPrivate.png',
		users: [Users[0], Users[1], Users[2], Users[5]],
		password: null,
		admin: [Users[1], Users[2]],
		owner: Users[1],
		mute: [Users[3]],
		banned: [Users[4]],
		messages: [{
								idMessage: 1,
								idChat: 4,
								date: 'Sep 5, 2018 12:32:27',
								message: 'lets play magic',
								idSender:2
							},
							{
								idMessage: 2,
								idChat: 4,
								date: 'Sep 5, 2018 12:33:27',
								message: 'go',
								idSender:3
							},
							{
								idMessage: 3,
								idChat: 4,
								date: 'Sep 5, 2018 12:34:27',
								message: 'commander or normal',
								idSender:2
							},
							{
								idMessage: 4,
								idChat: 4,
								date: 'Sep 5, 2018 12:35:27',
								message: 'commander!',
								idSender:3
							}]
	}
];

export default channels;
