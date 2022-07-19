import { rest } from 'msw';
import users from "@/data/users";

export default [

	rest.get('/user/:id', (req, res, ctx) => {
		return res(
			ctx.json(users.find(user => user.id === parseInt(req.params.id as string)))
		);
	}),

	rest.get('/users', (req, res, ctx) => {
		return res(
			ctx.json(users)
		);
	}),
];
