import type Discussion from '@/types/Discussion';
import Users from '@/data/users'
import ChatStatus from '@/types/ChatStatus';

const discussions = new Map<number, Discussion[]>([
	[
		1,
		[
			{
				id: 1,
				type: ChatStatus.DISCUSSION,
				user: Users[1],
				messages: [{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:32:28',
								message: 'how are you?',
								idSender: 6
							},
							{
								idMessage: 2,
								idChat: 1,
								date: 'Sep 5, 2018 12:33:28',
								message: 'fine and you?',
								idSender: 1
							},
							{
								idMessage: 3,
								idChat: 1,
								date: 'Sep 5, 2018 12:34:28',
								message: 'i am ok. where are you now?',
								idSender: 6
							},
							{
								idMessage: 4,
								idChat: 1,
								date: 'Sep 5, 2018 12:35:28',
								message: 'i am at Nice now?',
								idSender: 1
							}]
			},
			{
				id: 2,
				type: ChatStatus.DISCUSSION,
				user: Users[2],
				messages: [{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:32:28',
								message: 'how are you?',
								idSender: 2
							},
							{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:33:28',
								message: 'fine and you?',
								idSender: 6
							},
							{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:34:28',
								message: 'i am ok. where are you now?',
								idSender: 2
							},
							{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:35:28',
								message: 'i am at Nice now?',
								idSender: 6
							}]
			}
		],
	],
	[
		6,
		[
			{
				id: 3,
				type: ChatStatus.DISCUSSION,
				user: Users[3],
				messages: [{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:32:27',
								message: 'how are you?',
								idSender: 4
							},
							{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:33:27',
								message: 'fine and you?',
								idSender: 6
							},
							{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:34:27',
								message: 'i am ok. where are you now?',
								idSender: 4
							},
							{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:35:27',
								message: 'i am at Nice',
								idSender: 6
							}]
			},
			{
				id: 4,
				type: ChatStatus.DISCUSSION,
				user: Users[4],
				messages: [{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:32:28',
								message: 'Did you played yesterday',
								idSender: 5
							},
							{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:33:28',
								message: 'yes',
								idSender: 6
							},
							{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:34:28',
								message: 'did you win?',
								idSender: 5
							},
							{
								idMessage: 1,
								idChat: 1,
								date: 'Sep 5, 2018 12:35:28',
								message: 'of course!',
								idSender: 6
							}]
			}
		],
	],
]);

export default discussions;
