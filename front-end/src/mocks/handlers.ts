import { rest } from 'msw';
import users from "@/data/users";

export default [

	rest.get('/user/:username', (req, res, ctx) => {
		return res(
			ctx.json(users.find(user => user.username === req.params.username))
		);
	}),

	rest.get('/users', (req, res, ctx) => {
		return res(
			ctx.json(users)
		);
	}),
];
