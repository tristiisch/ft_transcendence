import { rest } from 'msw';
import matchs from "@/data/matchs";

export default [

	rest.get('/matchs', (req, res, ctx) => {
		return res(
			ctx.json(matchs)
		);
	}),
];
