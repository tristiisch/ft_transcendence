import Status from '@/types/Status';

const users = [
	{
		id: '42login0',
		username: 'Legolas',
		rank: 1,
		nbVictory: 4,
		nbDefeat: 2,
		avatar: 'https://vignette.wikia.nocookie.net/seigneur-des-anneaux/images/4/43/Legolas_greenleaf_orlando_bloom_lotr_by_push_pulse-d5vcniw.jpg/revision/latest?cb=20140416201846&path-prefix=fr',
		'2fa': false,
		current_status: Status.ONLINE,
	},
	{
		id: '42login1',
		username: 'Gandalf',
		rank: 3,
		nbVictory: 0,
		nbDefeat: 10,
		avatar: 'https://avatarfiles.alphacoders.com/290/290739.jpg',
		'2fa': false,
		current_status: Status.OFFLINE,
	},
	{
		id: '42login2',
		username: 'Boromir',
		rank: 2,
		nbVictory: 1,
		nbDefeat: 1,
		avatar: 'https://lastfm.freetls.fastly.net/i/u/770x0/385dc605ba402e2c9a0334cf2990cec4.jpg#385dc605ba402e2c9a0334cf2990cec4',
		'2fa': false,
		current_status: Status.INGAME,
	},
	{
		id: '42login3',
		username: 'Aragorn',
		rank: 4,
		nbVictory: 0,
		nbDefeat: 100,
		avatar: 'https://avatarfiles.alphacoders.com/257/257355.jpg',
		'2fa': 'false',
		current_status: Status.ONLINE,
	},
	{
		id: '42login4',
		username: 'Frodon',
		rank: 5,
		nbVictory: 4,
		nbDefeat: 100,
		avatar: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/47a52edc-4044-4149-b159-53d3f298c462/d6umrhk-fe4b292f-e30a-40fc-b932-07a0feca7fbc.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzQ3YTUyZWRjLTQwNDQtNDE0OS1iMTU5LTUzZDNmMjk4YzQ2MlwvZDZ1bXJoay1mZTRiMjkyZi1lMzBhLTQwZmMtYjkzMi0wN2EwZmVjYTdmYmMuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.wlWmNDIluH3_9jnKh3EO7AMh2pKCx4d1j8NO---C4hM',
		'2fa': 'false',
		current_status: Status.INGAME,
	},
	{
		id: '42login4',
		username: 'Frodon',
		rank: 5,
		nbVictory: 4,
		nbDefeat: 100,
		avatar: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/47a52edc-4044-4149-b159-53d3f298c462/d6umrhk-fe4b292f-e30a-40fc-b932-07a0feca7fbc.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzQ3YTUyZWRjLTQwNDQtNDE0OS1iMTU5LTUzZDNmMjk4YzQ2MlwvZDZ1bXJoay1mZTRiMjkyZi1lMzBhLTQwZmMtYjkzMi0wN2EwZmVjYTdmYmMuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.wlWmNDIluH3_9jnKh3EO7AMh2pKCx4d1j8NO---C4hM',
		'2fa': 'false',
		current_status: Status.INGAME,
	}
];

export default users;
