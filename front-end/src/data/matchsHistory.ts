import type matchHistory from '@/types/MatchHistory';

const matchsHistory = new Map<string, matchHistory[]>([
    ['nlaronch', [
	{
        date: 'Sep 5, 2018 12:32:28',
		opponent: 'Boromir',
		score: [3, 0],
        result: 'won',
	},
	{
        date: 'Sep 4, 2018 15:17:15',
		opponent: 'Aragorn',
		score: [0, 1],
        result: 'lost',
	},
    {
        date: 'Sep 3, 2018 21:40:22',
		opponent: 'Gandalf',
		score: [10, 0],
        result: 'won',
	},
    {
        date: 'Sep 2, 2018 11:31:34',
		opponent: 'Legolas',
		score: [4, 5],
        result: 'lost',
	},
    {
        date: 'Sep 1, 2018 12:33:23',
		opponent: 'Frodon',
		score: [2, 1],
        result: 'won',
	}],
]]);

export default matchsHistory;