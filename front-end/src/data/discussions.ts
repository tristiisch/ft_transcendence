import type Discussion from '@/types/Discussion';
import Users from '@/data/users'

const discussions = new Map<number, Discussion[]>([
	[
		1,
		[
			{
				user: Users[1],
				messages: [{
								date: 'Sep 5, 2018 12:32:28',
								message: 'how are you?',
								id:6
							},
							{
								date: 'Sep 5, 2018 12:33:28',
								message: 'fine and you?',
								id:1
							},
							{
								date: 'Sep 5, 2018 12:34:28',
								message: 'i am ok. where are you now?',
								id:6
							},
							{
								date: 'Sep 5, 2018 12:35:28',
								message: 'i am at Nice now?',
								id:1
							}]
			},
			{
				user: Users[2],
				messages: [{
								date: 'Sep 5, 2018 12:32:28',
								message: 'how are you?',
								id:2
							},
							{
								date: 'Sep 5, 2018 12:33:28',
								message: 'fine and you?',
								id:6
							},
							{
								date: 'Sep 5, 2018 12:34:28',
								message: 'i am ok. where are you now?',
								id:2
							},
							{
								date: 'Sep 5, 2018 12:35:28',
								message: 'i am at Nice now?',
								id:6
							}]
			}
		],
	],
	[
		6,
		[
			{
				user: Users[3],
				messages: [{
								date: 'Sep 5, 2018 12:32:27',
								message: 'how are you?',
								id:4
							},
							{
								date: 'Sep 5, 2018 12:33:27',
								message: 'fine and you?',
								id:6
							},
							{
								date: 'Sep 5, 2018 12:34:27',
								message: 'i am ok. where are you now?',
								id:4
							},
							{
								date: 'Sep 5, 2018 12:35:27',
								message: 'i am at Nice now?',
								id:6
							}]
			},
			{
				user: Users[4],
				messages: [{
								date: 'Sep 5, 2018 12:32:28',
								message: 'Did you played yesterday',
								id:5
							},
							{
								date: 'Sep 5, 2018 12:33:28',
								message: 'yes',
								id:6
							},
							{
								date: 'Sep 5, 2018 12:34:28',
								message: 'did you win?',
								id:5
							},
							{
								date: 'Sep 5, 2018 12:35:28',
								message: 'of course!',
								id:6
							}]
			}
		],
	],
]);

export default discussions;
